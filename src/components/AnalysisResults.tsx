import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { haversine, downloadCSV } from '@/lib/utils'
import { BarChart3, Download, Calculator } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

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

interface AnalysisResult {
  office_id: string
  office_name: string
  suppliers_count: number
  supplier_names: string[]
  coordinates: string
}

interface Dataset {
  id: string
  filename: string
  total_suppliers: number
  created_at: string
}

export function AnalysisResults() {
  const { user } = useAuth()
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [selectedDataset, setSelectedDataset] = useState<string>('')
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [offices, setOffices] = useState<Office[]>([])
  const [radius, setRadius] = useState([50])
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (selectedDataset) {
      fetchSuppliers(selectedDataset)
    }
  }, [selectedDataset])

  useEffect(() => {
    if (suppliers.length > 0 && offices.length > 0) {
      performAnalysis()
    }
  }, [suppliers, offices, radius])

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

      // Auto-select first dataset if available
      if (datasetsData && datasetsData.length > 0) {
        setSelectedDataset(datasetsData[0].id)
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

  const performAnalysis = async () => {
    if (suppliers.length === 0 || offices.length === 0) return

    setAnalyzing(true)
    setError('')

    try {
      const results: AnalysisResult[] = []

      for (const office of offices) {
        const suppliersWithinRadius: string[] = []
        
        for (const supplier of suppliers) {
          const distance = haversine(
            office.latitude,
            office.longitude,
            supplier.latitude,
            supplier.longitude
          )
          
          if (distance <= radius[0]) {
            suppliersWithinRadius.push(supplier.supplier_name)
          }
        }

        results.push({
          office_id: office.id,
          office_name: office.office_name,
          suppliers_count: suppliersWithinRadius.length,
          supplier_names: suppliersWithinRadius,
          coordinates: `${office.latitude.toFixed(6)}, ${office.longitude.toFixed(6)}`
        })
      }

      // Sort by supplier count (descending)
      results.sort((a, b) => b.suppliers_count - a.suppliers_count)
      setAnalysisResults(results)

      // Save analysis to database
      await saveAnalysisResults(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  const saveAnalysisResults = async (results: AnalysisResult[]) => {
    if (!user || !selectedDataset) return

    try {
      // Delete existing analyses for this dataset and radius
      await supabase
        .from('analyses')
        .delete()
        .eq('user_id', user.id)
        .eq('dataset_id', selectedDataset)
        .eq('radius_km', radius[0])

      // Insert new analyses
      const analysisInserts = results.map(result => ({
        user_id: user.id,
        dataset_id: selectedDataset,
        office_id: result.office_id,
        radius_km: radius[0],
        suppliers_count: result.suppliers_count,
        supplier_names: result.supplier_names
      }))

      const { error } = await supabase
        .from('analyses')
        .insert(analysisInserts)

      if (error) throw error
    } catch (err) {
      console.error('Failed to save analysis results:', err)
    }
  }

  const handleDownloadCSV = () => {
    if (analysisResults.length === 0) return

    const exportData = analysisResults.map((result, index) => ({
      Rank: index + 1,
      'Office Name': result.office_name,
      'Suppliers in Radius': result.suppliers_count,
      'Coordinates': result.coordinates,
      'Radius (km)': radius[0],
      'Supplier Names': result.supplier_names.join('; ')
    }))

    downloadCSV(exportData, `office_analysis_${radius[0]}km_${new Date().toISOString().split('T')[0]}.csv`)
  }

  const handleDownloadExcel = async () => {
    if (analysisResults.length === 0) return

    // This would require a library like xlsx to create Excel files
    // For now, we'll just download as CSV
    handleDownloadCSV()
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
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Analysis Controls
          </CardTitle>
          <CardDescription>
            Configure the analysis parameters and view supplier coverage results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Dataset</label>
              <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a dataset" />
                </SelectTrigger>
                <SelectContent>
                  {datasets.map((dataset) => (
                    <SelectItem key={dataset.id} value={dataset.id}>
                      {dataset.filename} ({dataset.total_suppliers} suppliers)
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

          {analyzing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner size="sm" />
              Analyzing supplier coverage...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {analysisResults.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Office Ranking
                </CardTitle>
                <CardDescription>
                  Offices ranked by supplier coverage within {radius[0]}km radius
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadExcel}>
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Office Name</TableHead>
                  <TableHead>Suppliers in Radius</TableHead>
                  <TableHead>Coordinates</TableHead>
                  <TableHead>Coverage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysisResults.map((result, index) => (
                  <TableRow key={result.office_id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          index === 0 ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          index === 1 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                          index === 2 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                          'bg-muted/50 text-muted-foreground border border-border'
                        }`}>
                          #{index + 1}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{result.office_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold">{result.suppliers_count}</span>
                        <span className="text-sm text-muted-foreground">suppliers</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {result.coordinates}
                    </TableCell>
                    <TableCell>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${(result.suppliers_count / Math.max(...analysisResults.map(r => r.suppliers_count))) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">
                        {suppliers.length > 0 ? ((result.suppliers_count / suppliers.length) * 100).toFixed(1) : 0}% of total
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Empty States */}
      {datasets.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No datasets found</h3>
            <p className="text-muted-foreground">
              Upload supplier data first to perform analysis.
            </p>
          </CardContent>
        </Card>
      )}

      {offices.length === 0 && datasets.length > 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No offices configured</h3>
            <p className="text-muted-foreground">
              Add potential office locations to see the analysis results.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}