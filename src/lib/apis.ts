// External API integrations for contextual information

export interface ReverseGeocodeResult {
  display_name: string
  city?: string
  state?: string
  country?: string
}

export interface RailwayStation {
  name: string
  latitude: number
  longitude: number
  distance_km: number
}

export interface Airport {
  name: string
  latitude: number
  longitude: number
  distance_km: number
}

export interface Highway {
  ref: string
  name?: string
  distance_km: number
}

export interface PopulationData {
  city: string
  country: string
  population: number
  as_of?: string
}

// Reverse geocoding using Nominatim (OpenStreetMap)
export async function reverseGeocode(lat: number, lon: number): Promise<ReverseGeocodeResult | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'LocationDensityApp/1.0'
        }
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    const address = data.address || {}

    return {
      display_name: data.display_name || '',
      city: address.city || address.town || address.village || address.county,
      state: address.state,
      country: address.country
    }
  } catch (error) {
    console.error('Reverse geocoding failed:', error)
    return null
  }
}

// Find nearest railway station using Overpass API
export async function findNearestRailwayStation(lat: number, lon: number, radiusMeters = 30000): Promise<RailwayStation | null> {
  const query = `
    [out:json][timeout:25];
    node(around:${radiusMeters},${lat},${lon})["railway"="station"];
    out body;
  `

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`
    })

    if (!response.ok) return null

    const data = await response.json()
    const stations = data.elements || []

    if (stations.length === 0) return null

    // Find closest station using Haversine distance
    let closest = stations[0]
    let minDistance = haversineDistance(lat, lon, closest.lat, closest.lon)

    for (const station of stations.slice(1)) {
      const distance = haversineDistance(lat, lon, station.lat, station.lon)
      if (distance < minDistance) {
        minDistance = distance
        closest = station
      }
    }

    return {
      name: closest.tags?.name || 'Unnamed Station',
      latitude: closest.lat,
      longitude: closest.lon,
      distance_km: Math.round(minDistance * 100) / 100
    }
  } catch (error) {
    console.error('Railway station search failed:', error)
    return null
  }
}

// Find nearest airport using Overpass API
export async function findNearestAirport(lat: number, lon: number, radiusMeters = 200000): Promise<Airport | null> {
  const query = `
    [out:json][timeout:30];
    (
      node(around:${radiusMeters},${lat},${lon})["aeroway"="aerodrome"];
      node(around:${radiusMeters},${lat},${lon})["aeroway"="airport"];
      way(around:${radiusMeters},${lat},${lon})["aeroway"="aerodrome"];
      way(around:${radiusMeters},${lat},${lon})["aeroway"="airport"];
    );
    out center body;
  `

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`
    })

    if (!response.ok) return null

    const data = await response.json()
    const airports = data.elements || []

    if (airports.length === 0) return null

    // Process airports and get coordinates (handle both nodes and ways)
    const processedAirports = airports.map((airport: any) => {
      let airportLat, airportLon
      
      if (airport.type === 'way' && airport.center) {
        airportLat = airport.center.lat
        airportLon = airport.center.lon
      } else {
        airportLat = airport.lat
        airportLon = airport.lon
      }
      
      return {
        ...airport,
        lat: airportLat,
        lon: airportLon,
        distance: haversineDistance(lat, lon, airportLat, airportLon)
      }
    }).filter((airport: any) => airport.lat && airport.lon)

    if (processedAirports.length === 0) return null

    // Find the closest airport
    const closest = processedAirports.reduce((prev: any, curr: any) => 
      prev.distance < curr.distance ? prev : curr
    )

    return {
      name: closest.tags?.name || closest.tags?.ref || 'Unnamed Airport',
      latitude: closest.lat,
      longitude: closest.lon,
      distance_km: Math.round(closest.distance * 100) / 100
    }
  } catch (error) {
    console.error('Airport search failed:', error)
    return null
  }
}

// Find nearby highways using Overpass API
export async function findNearbyHighways(lat: number, lon: number, radiusMeters = 50000, limit = 5): Promise<Highway[]> {
  const query = `
    [out:json][timeout:25];
    way(around:${radiusMeters},${lat},${lon})["highway"~"trunk|primary"]["ref"];
    out tags center;
  `

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`
    })

    if (!response.ok) return []

    const data = await response.json()
    const ways = data.elements || []

    const highways: Highway[] = []
    const seen = new Set<string>()

    for (const way of ways) {
      const tags = way.tags || {}
      const ref = tags.ref
      const name = tags.name
      const center = way.center

      if (!ref || !center || seen.has(ref)) continue

      const distance = haversineDistance(lat, lon, center.lat, center.lon)
      highways.push({
        ref,
        name,
        distance_km: Math.round(distance * 100) / 100
      })

      seen.add(ref)
    }

    // Sort by distance and limit results
    highways.sort((a, b) => a.distance_km - b.distance_km)
    return highways.slice(0, limit)
  } catch (error) {
    console.error('Highway search failed:', error)
    return []
  }
}

// Get population data using multiple strategies
export async function getPopulationData(cityName: string, countryCode = 'IN'): Promise<PopulationData | null> {
  if (!cityName) return null

  // Strategy 1: Try Nominatim for population data
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&countrycodes=${countryCode.toLowerCase()}&format=json&limit=1&extratags=1&namedetails=1`,
      {
        headers: {
          'User-Agent': 'LocationDensityApp/1.0'
        }
      }
    )

    if (response.ok) {
      const data = await response.json()
      if (data && data.length > 0) {
        const place = data[0]
        const population = place.extratags?.population || place.extratags?.pop
        
        if (population) {
          return {
            city: place.display_name.split(',')[0].trim(),
            country: 'India',
            population: parseInt(population.replace(/[^0-9]/g, '')) || 0
          }
        }
      }
    }
  } catch (error) {
    console.error('Nominatim population search failed:', error)
  }

  // Strategy 2: Try Overpass API for administrative boundaries with population
  try {
    const query = `
      [out:json][timeout:20];
      (
        relation["name"~"${cityName}"]["admin_level"~"[4-8]"]["place"~"city|town"];
        way["name"~"${cityName}"]["place"~"city|town"];
        node["name"~"${cityName}"]["place"~"city|town"];
      );
      out tags;
    `

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`
    })

    if (response.ok) {
      const data = await response.json()
      const elements = data.elements || []
      
      for (const element of elements) {
        const tags = element.tags || {}
        const population = tags.population || tags.pop
        
        if (population && tags.name) {
          return {
            city: tags.name,
            country: 'India',
            population: parseInt(population.replace(/[^0-9]/g, '')) || 0
          }
        }
      }
    }
  } catch (error) {
    console.error('Overpass population search failed:', error)
  }

  // Strategy 3: Return basic city info without population
  return {
    city: cityName,
    country: 'India',
    population: 0
  }
}

// Helper function for distance calculation
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}
