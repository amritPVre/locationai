import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { parseCoordinates, formatCoordinates } from '@/lib/utils'
import { Building, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

interface Office {
  id: string
  office_name: string
  latitude: number
  longitude: number
  created_at: string
}

export function OfficeManager() {
  const { user } = useAuth()
  const [offices, setOffices] = useState<Office[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Form state
  const [newOfficeName, setNewOfficeName] = useState('')
  const [newOfficeCoords, setNewOfficeCoords] = useState('')

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch offices')
    } finally {
      setLoading(false)
    }
  }

  const handleAddOffice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newOfficeName.trim() || !newOfficeCoords.trim()) return

    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      // Validate coordinates
      const coords = parseCoordinates(newOfficeCoords)
      if (!coords) {
        throw new Error('Invalid coordinates format. Use "latitude,longitude" (e.g., 28.6139,77.2090)')
      }

      // Check if we already have 6 offices (limit from original app)
      if (offices.length >= 6) {
        throw new Error('Maximum of 6 offices allowed. Please delete an existing office first.')
      }

      const { data, error } = await supabase
        .from('offices')
        .insert({
          user_id: user.id,
          office_name: newOfficeName.trim(),
          latitude: coords.lat,
          longitude: coords.lon
        })
        .select()

      if (error) throw error

      if (data && data[0]) {
        setOffices(prev => [data[0], ...prev])
        setNewOfficeName('')
        setNewOfficeCoords('')
        setSuccess(`Office "${newOfficeName}" added successfully!`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add office')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteOffice = async (officeId: string, officeName: string) => {
    if (!confirm(`Are you sure you want to delete "${officeName}"?`)) return

    setError('')
    setSuccess('')

    try {
      const { error } = await supabase
        .from('offices')
        .delete()
        .eq('id', officeId)

      if (error) throw error

      setOffices(prev => prev.filter(office => office.id !== officeId))
      setSuccess(`Office "${officeName}" deleted successfully!`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete office')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Manage Regional Offices
          </CardTitle>
          <CardDescription>
            Add up to 6 potential regional office locations for analysis. 
            Use coordinates in decimal format (e.g., 28.6139,77.2090 for Delhi).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          
          {success && (
            <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="h-4 w-4" />
              {success}
            </div>
          )}

          <form onSubmit={handleAddOffice} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="officeName" className="block text-sm font-medium mb-2">
                  Office Name
                </label>
                <Input
                  id="officeName"
                  placeholder="e.g., Delhi Regional Office"
                  value={newOfficeName}
                  onChange={(e) => setNewOfficeName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="officeCoords" className="block text-sm font-medium mb-2">
                  Coordinates (lat,lon)
                </label>
                <Input
                  id="officeCoords"
                  placeholder="e.g., 28.6139,77.2090"
                  value={newOfficeCoords}
                  onChange={(e) => setNewOfficeCoords(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={submitting || offices.length >= 6}
              className="flex items-center gap-2"
            >
              {submitting ? <Spinner size="sm" /> : <Plus className="h-4 w-4" />}
              Add Office ({offices.length}/6)
            </Button>
          </form>
        </CardContent>
      </Card>

      {offices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Offices</CardTitle>
            <CardDescription>
              {offices.length} office{offices.length !== 1 ? 's' : ''} configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {offices.map((office) => (
                <div
                  key={office.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{office.office_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatCoordinates(office.latitude, office.longitude)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Added {new Date(office.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteOffice(office.id, office.office_name)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {offices.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Building className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No offices yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first potential regional office location to get started with the analysis.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
