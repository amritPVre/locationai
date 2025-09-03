import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { haversine } from '@/lib/utils'
import { Map, MapPin, Building, Camera, Download } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import html2canvas from 'html2canvas'

// React Leaflet imports
import { MapContainer, TileLayer, Marker, Circle, Polyline, Popup, useMap } from 'react-leaflet'
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

// Map capture component that has access to the map instance
function MapCapture({ onCapture }: { onCapture: (mapInstance: L.Map) => void }) {
  const map = useMap()
  
  useEffect(() => {
    if (map) {
      // Pass the map instance to parent when ready
      onCapture(map)
    }
  }, [map, onCapture])
  
  return null
}

export function MapView() {
  const { user } = useAuth()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [selectedDataset, setSelectedDataset] = useState<string>('')
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [offices, setOffices] = useState<Office[]>([])
  const [selectedOffice, setSelectedOffice] = useState<string>('')
  const [radius, setRadius] = useState([50])
  const [loading, setLoading] = useState(true)
  const [captureLoading, setCaptureLoading] = useState(false)
  const [mapStyle, setMapStyle] = useState<'street' | 'satellite'>('street')
  const [captureSuccess, setCaptureSuccess] = useState(false)
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

  // Handle map instance ready
  const handleMapReady = (mapInstance: L.Map) => {
    mapInstanceRef.current = mapInstance
  }

  const captureMap = async () => {
    if (!mapInstanceRef.current || !mapRef.current) return

    setCaptureLoading(true)
    try {
      const map = mapInstanceRef.current

      // Force map to invalidate size and re-render all layers
      map.invalidateSize(true)
      
      // Wait for all map tiles to fully load
      await new Promise(resolve => {
        let tilesLoading = 0
        let tilesLoaded = 0
        
        const checkTilesLoaded = () => {
          if (tilesLoading === tilesLoaded) {
            setTimeout(resolve, 1000) // Extra buffer for rendering
          }
        }

        // Track tile loading events
        map.eachLayer((layer: any) => {
          if (layer._url) { // This is a tile layer
            layer.on('tileloadstart', () => {
              tilesLoading++
            })
            layer.on('tileload', () => {
              tilesLoaded++
              checkTilesLoaded()
            })
            layer.on('tileerror', () => {
              tilesLoaded++
              checkTilesLoaded()
            })
          }
        })

        // Fallback timeout
        setTimeout(resolve, 3000)
      })

      // Capture the entire map div with enhanced settings
      const canvas = await html2canvas(mapRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: 'transparent',
        scale: 2, // High quality
        logging: false,
        width: mapRef.current.offsetWidth,
        height: mapRef.current.offsetHeight,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        foreignObjectRendering: false, // Better for map elements
        imageTimeout: 15000,
        removeContainer: false,
        ignoreElements: (element) => {
          // Only ignore controls we don't want in the capture
          return element.classList.contains('leaflet-control-zoom')
        },
        onclone: (clonedDoc, element) => {
          // Apply critical fixes for map positioning in the cloned document
          const clonedMapContainer = clonedDoc.querySelector('.leaflet-container') as HTMLElement
          if (clonedMapContainer) {
            // Reset all transforms that might cause positioning issues
            clonedMapContainer.style.transform = 'none !important'
            clonedMapContainer.style.position = 'relative'
            clonedMapContainer.style.left = '0'
            clonedMapContainer.style.top = '0'
            
            // Fix all panes
            const allPanes = clonedMapContainer.querySelectorAll('.leaflet-pane')
            allPanes.forEach((pane: Element) => {
              const htmlPane = pane as HTMLElement
              htmlPane.style.transform = 'translate3d(0px, 0px, 0px) !important'
              htmlPane.style.left = '0'
              htmlPane.style.top = '0'
            })

            // Specifically fix the map pane which contains the tiles
            const mapPane = clonedMapContainer.querySelector('.leaflet-map-pane') as HTMLElement
            if (mapPane) {
              mapPane.style.transform = 'translate3d(0px, 0px, 0px) !important'
              mapPane.style.left = '0'
              mapPane.style.top = '0'
            }

            // Fix marker and overlay panes
            const markerPane = clonedMapContainer.querySelector('.leaflet-marker-pane') as HTMLElement
            if (markerPane) {
              markerPane.style.transform = 'translate3d(0px, 0px, 0px) !important'
            }

            const overlayPane = clonedMapContainer.querySelector('.leaflet-overlay-pane') as HTMLElement
            if (overlayPane) {
              overlayPane.style.transform = 'translate3d(0px, 0px, 0px) !important'
            }
          }
        }
      })

      // Generate filename with office and date info
      const selectedOfficeName = selectedOfficeData?.office_name || 'office'
      const dateStr = new Date().toISOString().split('T')[0]
      const timeStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '-')
      const filename = `kmlytics-${selectedOfficeName.replace(/\s+/g, '-').toLowerCase()}-${dateStr}-${timeStr}.png`

      // Create download link
      const link = document.createElement('a')
      link.download = filename
      link.href = canvas.toDataURL('image/png', 1.0)
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Show success message
      setCaptureSuccess(true)
      setError('')
      
      // Hide success message after 3 seconds
      setTimeout(() => setCaptureSuccess(false), 3000)
    } catch (err) {
      setError('Failed to capture map. Please try again.')
      console.error('Map capture error:', err)
    } finally {
      setCaptureLoading(false)
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

          {/* Map Style Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium mb-2">Map Style</label>
              <Select value={mapStyle} onValueChange={(value: 'street' | 'satellite') => setMapStyle(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="street">Street Map</SelectItem>
                  <SelectItem value="satellite">Satellite</SelectItem>
                </SelectContent>
              </Select>
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

      {/* Map Capture Button */}
      {selectedOfficeData && suppliers.length > 0 && (
        <div className="flex justify-end space-x-4">
          {captureSuccess && (
            <div className="flex items-center text-green-400 text-sm font-medium bg-green-400/10 px-4 py-2 rounded-lg border border-green-400/30">
              <Download className="w-4 h-4 mr-2" />
              Map captured successfully!
            </div>
          )}
          
          <Button 
            onClick={captureMap}
            disabled={captureLoading}
            className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white font-medium shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105"
          >
            {captureLoading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Capturing Map...
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 mr-2" />
                Capture Map as PNG
              </>
            )}
          </Button>
        </div>
      )}

      {/* Map */}
      <Card>
        <CardContent className="p-0">
          <div 
            ref={mapRef}
            className="w-full h-96 md:h-[600px] rounded-lg overflow-hidden relative"
            style={{ 
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Map Info Overlay for Captured Image */}
            <div className="absolute top-4 left-4 z-[1000] bg-black/80 backdrop-blur-sm rounded-xl p-4 text-white text-sm pointer-events-none map-overlay">
              <div className="flex items-center space-x-2 mb-2">
                <div className="relative">
                  <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div className="absolute -top-1 -left-1 w-2 h-2 border border-dashed border-cyan-400 rounded-full opacity-60"></div>
                </div>
                <span className="font-bold">Kmlytics</span>
              </div>
              
              {selectedOfficeData && (
                <div className="space-y-1">
                  <div className="font-medium text-cyan-400">Analysis Overview</div>
                  <div>Office: {selectedOfficeData.office_name}</div>
                  <div>Coverage Radius: {radius[0]} km</div>
                  <div>Suppliers: {suppliers.length}</div>
                  <div>In Coverage: {suppliers.filter(s => {
                    const distance = haversine(
                      selectedOfficeData.latitude,
                      selectedOfficeData.longitude,
                      s.latitude,
                      s.longitude
                    )
                    return distance <= radius[0]
                  }).length}</div>
                  <div className="text-xs text-gray-300 mt-2">
                    Generated: {new Date().toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>

            <MapContainer
              center={getMapCenter()}
              zoom={6}
              style={{ 
                height: '100%', 
                width: '100%',
                position: 'relative',
                zIndex: 1
              }}
              className="rounded-lg map-container"
              preferCanvas={true}
            >
              <MapCapture onCapture={handleMapReady} />
              {mapStyle === 'street' ? (
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              ) : (
                <TileLayer
                  attribution='&copy; <a href="https://www.esri.com/">Esri</a>, Earthstar Geographics'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  maxZoom={19}
                />
              )}
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