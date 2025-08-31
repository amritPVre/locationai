import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { haversine } from '@/lib/utils'
import { Map, MapPin, Building } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

// React Leaflet imports
import { MapContainer, TileLayer, Marker, Circle, Polyline, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in Leaflet with Vite
const createIcon = (color: string, isOffice = false) => {
  if (isOffice) {
    return L.divIcon({
      html: `<div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><svg width="14" height="14" fill="white" viewBox="0 0 24 24"><path d="M10 2v2H8v4h2v2h2V8h2V4h-2V2h-2zm0 8v12h12V10H10z"/></svg></div>`,
      className: 'custom-div-icon',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    })
  }
  
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>`,
    className: 'custom-div-icon',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  })
}

interface Supplier {
  id: string
  supplier_name: string
  latitude: number
  longitude: number
  dataset_id: string
}

interface Office {
  id: string
  office_name: string
  latitude: number
  longitude: number
}

interface Dataset {
  id: string
  filename: string
  total_suppliers: number
}

export function MapView() {
  const { user } = useAuth()
  
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [selectedDataset, setSelectedDataset] = useState<string>('')
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [offices, setOffices] = useState<Office[]>([])
  const [selectedOffice, setSelectedOffice] = useState<string>('')
  const [radius, setRadius] = useState([50])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (selectedDataset) {
      fetchSuppliers(selectedDataset)
    }
  }, [selectedDataset])

  const fetchInitialData = async () => {
    if (!user) return

    try {
      // Fetch datasets
      const { data: datasetsData, error: datasetsError } = await supabase
        .from('datasets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (datasetsError) throw datasetsError

      // Fetch offices
      const { data: officesData, error: officesError } = await supabase
        .from('offices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (officesError) throw officesError

      setDatasets(datasetsData || [])
      setOffices(officesData || [])

      // Auto-select first dataset and office if available
      if (datasetsData && datasetsData.length > 0) {
        setSelectedDataset(datasetsData[0].id)
      }
      if (officesData && officesData.length > 0) {
        setSelectedOffice(officesData[0].id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const fetchSuppliers = async (datasetId: string) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('user_id', user.id)
        .eq('dataset_id', datasetId)

      if (error) throw error
      setSuppliers(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch suppliers')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="lg" />
      </div>
    )
  }

  const selectedOfficeData = offices.find(office => office.id === selectedOffice)
  
  // Calculate map center and bounds
  const getMapCenter = (): [number, number] => {
    if (selectedOfficeData) {
      return [selectedOfficeData.latitude, selectedOfficeData.longitude]
    }
    if (suppliers.length > 0) {
      const avgLat = suppliers.reduce((sum, s) => sum + s.latitude, 0) / suppliers.length
      const avgLon = suppliers.reduce((sum, s) => sum + s.longitude, 0) / suppliers.length
      return [avgLat, avgLon]
    }
    return [28.6139, 77.2090] // Default to Delhi, India
  }

  const renderMapContent = () => {
    if (!selectedOfficeData || suppliers.length === 0) return null

    const suppliersInRadius = suppliers.filter(supplier => {
      const distance = haversine(
        selectedOfficeData.latitude,
        selectedOfficeData.longitude,
        supplier.latitude,
        supplier.longitude
      )
      return distance <= radius[0]
    })

    return (
      <>
        {/* Office marker */}
        <Marker
          position={[selectedOfficeData.latitude, selectedOfficeData.longitude]}
          icon={createIcon('#ef4444', true)}
        >
          <Popup>
            <div>
              <strong>{selectedOfficeData.office_name}</strong><br />
              Coordinates: {selectedOfficeData.latitude.toFixed(4)}, {selectedOfficeData.longitude.toFixed(4)}<br />
              Suppliers in radius: {suppliersInRadius.length}
            </div>
          </Popup>
        </Marker>

        {/* Radius circle */}
        <Circle
          center={[selectedOfficeData.latitude, selectedOfficeData.longitude]}
          radius={radius[0] * 1000} // Convert km to meters
          pathOptions={{
            color: '#ef4444',
            fillColor: '#ef4444',
            fillOpacity: 0.1,
            weight: 2
          }}
        />

        {/* Supplier markers */}
        {suppliers.map((supplier) => {
          const distance = haversine(
            selectedOfficeData.latitude,
            selectedOfficeData.longitude,
            supplier.latitude,
            supplier.longitude
          )
          const isWithinRadius = distance <= radius[0]
          const color = isWithinRadius ? '#22c55e' : '#3b82f6'

          return (
            <div key={supplier.id}>
              <Marker
                position={[supplier.latitude, supplier.longitude]}
                icon={createIcon(color)}
              >
                <Popup>
                  <div>
                    <strong>{supplier.supplier_name}</strong><br />
                    Distance: {distance.toFixed(2)} km<br />
                    Status: {isWithinRadius ? 'Within radius' : 'Outside radius'}
                  </div>
                </Popup>
              </Marker>

              {/* Connecting line */}
              <Polyline
                positions={[
                  [selectedOfficeData.latitude, selectedOfficeData.longitude],
                  [supplier.latitude, supplier.longitude]
                ]}
                pathOptions={{
                  color: '#6b7280',
                  weight: 1,
                  dashArray: '5, 5',
                  opacity: 0.6
                }}
              />
            </div>
          )
        })}
      </>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Interactive Map View
          </CardTitle>
          <CardDescription>
            Visualize office locations and supplier coverage on an interactive map
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Dataset</label>
              <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                <SelectTrigger>
                  <SelectValue placeholder="Select dataset" />
                </SelectTrigger>
                <SelectContent>
                  {datasets.map((dataset) => (
                    <SelectItem key={dataset.id} value={dataset.id}>
                      {dataset.filename}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Office</label>
              <Select value={selectedOffice} onValueChange={setSelectedOffice}>
                <SelectTrigger>
                  <SelectValue placeholder="Select office" />
                </SelectTrigger>
                <SelectContent>
                  {offices.map((office) => (
                    <SelectItem key={office.id} value={office.id}>
                      {office.office_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Radius: {radius[0]} km
              </label>
              <Slider
                value={radius}
                onValueChange={setRadius}
                max={500}
                min={10}
                step={10}
                className="w-full"
              />
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                <Building className="w-3 h-3 text-white" />
              </div>
              <span>Office Location</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full border border-white"></div>
              <span>Supplier (Within Radius)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full border border-white"></div>
              <span>Supplier (Outside Radius)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <Card>
        <CardContent className="p-0">
          <div className="w-full h-96 md:h-[600px] rounded-lg overflow-hidden">
            <MapContainer
              center={getMapCenter()}
              zoom={6}
              style={{ height: '100%', width: '100%' }}
              className="rounded-lg"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {renderMapContent()}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Empty States */}
      {datasets.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No datasets found</h3>
            <p className="text-muted-foreground">
              Upload supplier data first to view locations on the map.
            </p>
          </CardContent>
        </Card>
      )}

      {offices.length === 0 && datasets.length > 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Building className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No offices configured</h3>
            <p className="text-muted-foreground">
              Add potential office locations to see them on the map.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}