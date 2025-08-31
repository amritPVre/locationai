import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { 
  reverseGeocode, 
  findNearestRailwayStation, 
  findNearestAirport, 
  findNearbyHighways, 
  getPopulationData,
  type ReverseGeocodeResult,
  type RailwayStation,
  type Airport,
  type Highway,
  type PopulationData
} from '@/lib/apis'
import { MapPin, Train, Plane, Route, Users, Search, AlertCircle } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

interface Office {
  id: string
  office_name: string
  latitude: number
  longitude: number
}

interface ContextualData {
  location: ReverseGeocodeResult | null
  railwayStation: RailwayStation | null
  airport: Airport | null
  highways: Highway[]
  population: PopulationData | null
}

export function ContextualInfo() {
  const { user } = useAuth()
  const [offices, setOffices] = useState<Office[]>([])
  const [selectedOffice, setSelectedOffice] = useState<string>('')
  const [contextualData, setContextualData] = useState<ContextualData | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchOffices()
  }, [])

  const fetchOffices = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('offices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setOffices(data || [])
      if (data && data.length > 0) {
        setSelectedOffice(data[0].id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch offices')
    } finally {
      setLoading(false)
    }
  }

  const fetchContextualInfo = async () => {
    const office = offices.find(o => o.id === selectedOffice)
    if (!office) return

    setFetching(true)
    setError('')

    try {
      // Fetch all contextual information in parallel
      const [location, railwayStation, airport, highways] = await Promise.allSettled([
        reverseGeocode(office.latitude, office.longitude),
        findNearestRailwayStation(office.latitude, office.longitude),
        findNearestAirport(office.latitude, office.longitude),
        findNearbyHighways(office.latitude, office.longitude)
      ])

      const locationResult = location.status === 'fulfilled' ? location.value : null
      let populationResult = null

      // If we have location data with a city, fetch population
      if (locationResult?.city) {
        try {
          populationResult = await getPopulationData(locationResult.city)
        } catch (err) {
          console.error('Population fetch failed:', err)
        }
      }

      setContextualData({
        location: locationResult,
        railwayStation: railwayStation.status === 'fulfilled' ? railwayStation.value : null,
        airport: airport.status === 'fulfilled' ? airport.value : null,
        highways: highways.status === 'fulfilled' ? highways.value : [],
        population: populationResult
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contextual information')
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    if (selectedOffice && offices.length > 0) {
      fetchContextualInfo()
    }
  }, [selectedOffice, offices])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="lg" />
      </div>
    )
  }

  const selectedOfficeData = offices.find(o => o.id === selectedOffice)

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Contextual Information
          </CardTitle>
          <CardDescription>
            Get detailed information about office locations including nearby infrastructure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Select Office</label>
              <Select value={selectedOffice} onValueChange={setSelectedOffice}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an office" />
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
            <div className="pt-6">
              <Button onClick={fetchContextualInfo} disabled={fetching || !selectedOffice}>
                {fetching ? <Spinner size="sm" className="mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                Refresh Data
              </Button>
            </div>
          </div>

          {selectedOfficeData && (
            <div className="p-3 bg-gray-50 rounded-md">
              <h3 className="font-medium">{selectedOfficeData.office_name}</h3>
              <p className="text-sm text-muted-foreground">
                Coordinates: {selectedOfficeData.latitude.toFixed(6)}, {selectedOfficeData.longitude.toFixed(6)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contextual Information Display */}
      {contextualData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contextualData.location ? (
                <div className="space-y-2">
                  <div>
                    <strong>Address:</strong>
                    <p className="text-sm text-muted-foreground">{contextualData.location.display_name}</p>
                  </div>
                  {contextualData.location.city && (
                    <div>
                      <strong>City:</strong> {contextualData.location.city}
                    </div>
                  )}
                  {contextualData.location.state && (
                    <div>
                      <strong>State:</strong> {contextualData.location.state}
                    </div>
                  )}
                  {contextualData.location.country && (
                    <div>
                      <strong>Country:</strong> {contextualData.location.country}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No location data available</p>
              )}
            </CardContent>
          </Card>

          {/* Population Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Population Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contextualData.population ? (
                <div className="space-y-2">
                  <div>
                    <strong>City:</strong> {contextualData.population.city}
                  </div>
                  <div>
                    <strong>Population:</strong> {
                      contextualData.population.population > 0 
                        ? contextualData.population.population.toLocaleString()
                        : 'Data not available'
                    }
                  </div>
                  <div>
                    <strong>Country:</strong> {contextualData.population.country}
                  </div>
                  {contextualData.population.as_of && (
                    <div className="text-sm text-muted-foreground">
                      As of: {contextualData.population.as_of}
                    </div>
                  )}
                  {contextualData.population.population === 0 && (
                    <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                      💡 Population data may be available from government census records
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No population data available</p>
              )}
            </CardContent>
          </Card>

          {/* Railway Station */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Train className="h-5 w-5" />
                Nearest Railway Station
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contextualData.railwayStation ? (
                <div className="space-y-2">
                  <div>
                    <strong>Name:</strong> {contextualData.railwayStation.name}
                  </div>
                  <div>
                    <strong>Distance:</strong> {contextualData.railwayStation.distance_km} km
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Coordinates: {contextualData.railwayStation.latitude.toFixed(4)}, {contextualData.railwayStation.longitude.toFixed(4)}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No railway station found within 30km radius</p>
              )}
            </CardContent>
          </Card>

          {/* Airport */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5" />
                Nearest Airport
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contextualData.airport ? (
                <div className="space-y-2">
                  <div>
                    <strong>Name:</strong> {contextualData.airport.name}
                  </div>
                  <div>
                    <strong>Distance:</strong> {contextualData.airport.distance_km} km
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Coordinates: {contextualData.airport.latitude.toFixed(4)}, {contextualData.airport.longitude.toFixed(4)}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No airport found within 200km radius</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Highways */}
      {contextualData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5" />
              Nearby Highways
            </CardTitle>
            <CardDescription>
              Major highways within 50km radius
            </CardDescription>
          </CardHeader>
          <CardContent>
            {contextualData.highways.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-foreground font-medium">Highway Ref</th>
                      <th className="text-left py-2 text-foreground font-medium">Name</th>
                      <th className="text-left py-2 text-foreground font-medium">Distance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contextualData.highways.map((highway, index) => (
                      <tr key={index} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="py-2 font-medium text-foreground">{highway.ref}</td>
                        <td className="py-2 text-muted-foreground">{highway.name || 'N/A'}</td>
                        <td className="py-2 text-muted-foreground">{highway.distance_km} km</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground">No major highways found nearby</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {offices.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No offices configured</h3>
            <p className="text-muted-foreground">
              Add office locations first to view contextual information.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {fetching && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Spinner size="lg" className="mb-4" />
              <p className="text-muted-foreground">Fetching contextual information...</p>
              <p className="text-sm text-muted-foreground">This may take a few seconds</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}