import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { parseCoordinates, formatFileSize, generateUUID } from '@/lib/utils'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'

interface ParsedData {
  supplier_name: string
  supplier_coords: string
  latitude?: number
  longitude?: number
}

export function FileUpload() {
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [previewData, setPreviewData] = useState<ParsedData[]>([])
  const [showPreview, setShowPreview] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setError('')
    setSuccess('')
    setShowPreview(false)
    setPreviewData([])
  }

  const parseFile = useCallback(async (file: File): Promise<ParsedData[]> => {
    return new Promise((resolve, reject) => {
      const fileType = file.name.toLowerCase().endsWith('.csv') ? 'csv' : 'excel'
      
      if (fileType === 'csv') {
        Papa.parse(file, {
          header: true,
          complete: (results) => {
            resolve(results.data as ParsedData[])
          },
          error: (error) => {
            reject(new Error(`CSV parsing error: ${error.message}`))
          }
        })
      } else {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer)
            const workbook = XLSX.read(data, { type: 'array' })
            const sheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[sheetName]
            const jsonData = XLSX.utils.sheet_to_json(worksheet) as ParsedData[]
            resolve(jsonData)
          } catch (error) {
            reject(new Error(`Excel parsing error: ${error}`))
          }
        }
        reader.onerror = () => reject(new Error('File reading error'))
        reader.readAsArrayBuffer(file)
      }
    })
  }, [])

  const handlePreview = async () => {
    if (!file) return

    setLoading(true)
    setError('')

    try {
      const data = await parseFile(file)
      
      // Validate required columns
      if (data.length === 0) {
        throw new Error('File is empty')
      }

      const firstRow = data[0]
      if (!firstRow.supplier_name && !firstRow['supplier_name']) {
        throw new Error('Missing required column: supplier_name')
      }
      if (!firstRow.supplier_coords && !firstRow['supplier_coords']) {
        throw new Error('Missing required column: supplier_coords')
      }

      // Normalize column names and parse coordinates
      const processedData = data.map((row, index) => {
        const supplierName = row.supplier_name || row['supplier_name'] || ''
        const supplierCoords = row.supplier_coords || row['supplier_coords'] || ''
        
        if (!supplierName) {
          throw new Error(`Row ${index + 1}: Missing supplier name`)
        }
        if (!supplierCoords) {
          throw new Error(`Row ${index + 1}: Missing supplier coordinates`)
        }

        const coords = parseCoordinates(supplierCoords.toString())
        if (!coords) {
          throw new Error(`Row ${index + 1}: Invalid coordinates format. Expected "lat,lon"`)
        }

        return {
          supplier_name: supplierName.toString(),
          supplier_coords: supplierCoords.toString(),
          latitude: coords.lat,
          longitude: coords.lon
        }
      }).filter(row => row.supplier_name && row.latitude && row.longitude)

      if (processedData.length === 0) {
        throw new Error('No valid data rows found')
      }

      setPreviewData(processedData.slice(0, 10)) // Show first 10 rows
      setShowPreview(true)
      setSuccess(`Found ${processedData.length} valid supplier records`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    if (!file || !user) return

    setLoading(true)
    setError('')

    try {
      const data = await parseFile(file)
      
      // Process data similar to preview
      const processedData = data.map((row, index) => {
        const supplierName = row.supplier_name || row['supplier_name'] || ''
        const supplierCoords = row.supplier_coords || row['supplier_coords'] || ''
        
        const coords = parseCoordinates(supplierCoords.toString())
        if (!coords) {
          throw new Error(`Row ${index + 1}: Invalid coordinates`)
        }

        return {
          supplier_name: supplierName.toString(),
          supplier_coords: supplierCoords.toString(),
          latitude: coords.lat,
          longitude: coords.lon
        }
      }).filter(row => row.supplier_name && row.latitude && row.longitude)

      // Upload file to Supabase Storage
      const fileName = `${user.id}/${Date.now()}_${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('datasets')
        .upload(fileName, file)

      if (uploadError) {
        throw new Error(`File upload failed: ${uploadError.message}`)
      }

      // Create dataset record
      const datasetId = generateUUID()
      const { error: datasetError } = await supabase
        .from('datasets')
        .insert({
          id: datasetId,
          user_id: user.id,
          filename: file.name,
          file_url: uploadData.path,
          total_suppliers: processedData.length
        })

      if (datasetError) {
        throw new Error(`Failed to save dataset: ${datasetError.message}`)
      }

      // Insert supplier data
      const supplierInserts = processedData.map(row => ({
        user_id: user.id,
        dataset_id: datasetId,
        supplier_name: row.supplier_name,
        latitude: row.latitude!,
        longitude: row.longitude!,
        original_coordinates: row.supplier_coords
      }))

      const { error: suppliersError } = await supabase
        .from('suppliers')
        .insert(supplierInserts)

      if (suppliersError) {
        throw new Error(`Failed to save suppliers: ${suppliersError.message}`)
      }

      setSuccess(`Successfully uploaded ${processedData.length} suppliers!`)
      setFile(null)
      setPreviewData([])
      setShowPreview(false)
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Supplier Data
          </CardTitle>
          <CardDescription>
            Upload Excel (.xlsx) or CSV files with supplier information. 
            Required columns: supplier_name, supplier_coords (lat,lon format)
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

          <div className="space-y-4">
            <div>
              <Input
                id="file-upload"
                type="file"
                accept=".xlsx,.csv"
                onChange={handleFileSelect}
              />
            </div>

            {file && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-sm text-muted-foreground">({formatFileSize(file.size)})</span>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handlePreview} 
                disabled={!file || loading}
                variant="outline"
              >
                {loading ? <Spinner size="sm" className="mr-2" /> : null}
                Preview Data
              </Button>
              
              {showPreview && (
                <Button onClick={handleUpload} disabled={loading}>
                  {loading ? <Spinner size="sm" className="mr-2" /> : null}
                  Upload to Database
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {showPreview && previewData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Data Preview</CardTitle>
            <CardDescription>
              Showing first 10 rows. Review the data before uploading.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse border border-border">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border border-border px-3 py-2 text-left text-foreground font-medium">Supplier Name</th>
                    <th className="border border-border px-3 py-2 text-left text-foreground font-medium">Original Coords</th>
                    <th className="border border-border px-3 py-2 text-left text-foreground font-medium">Latitude</th>
                    <th className="border border-border px-3 py-2 text-left text-foreground font-medium">Longitude</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-card' : 'bg-muted/30'}>
                      <td className="border border-border px-3 py-2 text-foreground">{row.supplier_name}</td>
                      <td className="border border-border px-3 py-2 text-muted-foreground">{row.supplier_coords}</td>
                      <td className="border border-border px-3 py-2 text-muted-foreground">{row.latitude}</td>
                      <td className="border border-border px-3 py-2 text-muted-foreground">{row.longitude}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
