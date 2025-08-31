import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { haversine } from '@/lib/utils'
import { 
  generateAIRecommendation, 
  generateSWOTAnalysis,
  type AnalysisResult, 
  type ContextualData,
  type SWOTAnalysis
} from '@/lib/ai'
import { generateSWOTPowerPoint } from '@/lib/pptx'
import { 
  reverseGeocode, 
  findNearestRailwayStation, 
  findNearestAirport, 
  findNearbyHighways, 
  getPopulationData 
} from '@/lib/apis'
import { Brain, Lightbulb, Download, Wand2, TrendingUp, AlertTriangle, Target, Shield } from 'lucide-react'
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

interface Dataset {
  id: string
  filename: string
  total_suppliers: number
}

export function AIInsights() {
  const { user } = useAuth()
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [selectedDataset, setSelectedDataset] = useState<string>('')
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [offices, setOffices] = useState<Office[]>([])
  const [selectedOffice, setSelectedOffice] = useState<string>('')
  const [radius] = useState(50) // Default radius for AI analysis
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [contextualData, setContextualData] = useState<ContextualData | null>(null)
  
  // AI Results
  const [aiRecommendation, setAiRecommendation] = useState<string>('')
  const [swotAnalysis, setSWOTAnalysis] = useState<SWOTAnalysis | null>(null)
  
  // Loading states
  const [loading, setLoading] = useState(true)
  const [generatingRecommendation, setGeneratingRecommendation] = useState(false)
  const [generatingSWOT, setGeneratingSWOT] = useState(false)
  const [fetchingContext, setFetchingContext] = useState(false)
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

  const performAnalysis = () => {
    if (suppliers.length === 0 || offices.length === 0) return

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
        
        if (distance <= radius) {
          suppliersWithinRadius.push(supplier.supplier_name)
        }
      }

      results.push({
        office_name: office.office_name,
        suppliers_count: suppliersWithinRadius.length,
        coordinates: `${office.latitude.toFixed(6)}, ${office.longitude.toFixed(6)}`,
        rank: 0 // Will be set after sorting
      })
    }

    // Sort by supplier count and assign ranks
    results.sort((a, b) => b.suppliers_count - a.suppliers_count)
    results.forEach((result, index) => {
      result.rank = index + 1
    })

    setAnalysisResults(results)
  }

  const fetchContextualData = async (officeName: string) => {
    const office = offices.find(o => o.office_name === officeName)
    if (!office) return null

    setFetchingContext(true)

    try {
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

      const contextData: ContextualData = {
        location: locationResult || undefined,
        railwayStation: railwayStation.status === 'fulfilled' ? railwayStation.value || undefined : undefined,
        airport: airport.status === 'fulfilled' ? airport.value || undefined : undefined,
        highways: highways.status === 'fulfilled' ? highways.value : undefined,
        population: populationResult || undefined
      }

      setContextualData(contextData)
      return contextData
    } catch (err) {
      console.error('Failed to fetch contextual data:', err)
      return null
    } finally {
      setFetchingContext(false)
    }
  }

  const handleGenerateRecommendation = async () => {
    if (analysisResults.length === 0) {
      setError('No analysis results available. Please ensure you have uploaded data and configured offices.')
      return
    }

    setGeneratingRecommendation(true)
    setError('')

    try {
      // Fetch contextual data for the top office if not already available
      if (!contextualData && analysisResults.length > 0) {
        await fetchContextualData(analysisResults[0].office_name)
      }

      const recommendation = await generateAIRecommendation(
        analysisResults,
        contextualData,
        radius
      )

      setAiRecommendation(recommendation)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate AI recommendation')
    } finally {
      setGeneratingRecommendation(false)
    }
  }

  const handleGenerateSWOT = async () => {
    if (!selectedOffice || analysisResults.length === 0) {
      setError('Please select an office and ensure analysis data is available.')
      return
    }

    const selectedOfficeData = analysisResults.find(r => 
      offices.find(o => o.id === selectedOffice)?.office_name === r.office_name
    )

    if (!selectedOfficeData) {
      setError('Selected office not found in analysis results.')
      return
    }

    setGeneratingSWOT(true)
    setError('')

    try {
      // Fetch contextual data for the selected office
      const selectedOfficeName = offices.find(o => o.id === selectedOffice)?.office_name
      let currentContextData = contextualData
      
      if (selectedOfficeName) {
        console.log('Fetching context for office:', selectedOfficeName)
        currentContextData = await fetchContextualData(selectedOfficeName)
        console.log('Fetched context data:', currentContextData)
      }

      console.log('Generating SWOT for office:', selectedOfficeData)
      console.log('Context data available:', !!currentContextData)
      console.log('Analysis results count:', analysisResults.length)

      const swot = await generateSWOTAnalysis(
        selectedOfficeData,
        analysisResults,
        currentContextData,
        radius
      )

      console.log('Generated SWOT:', swot)
      setSWOTAnalysis(swot)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate SWOT analysis')
    } finally {
      setGeneratingSWOT(false)
    }
  }

  const handleExportToPowerPoint = () => {
    if (!swotAnalysis || !selectedOffice) return

    const selectedOfficeData = analysisResults.find(r => 
      offices.find(o => o.id === selectedOffice)?.office_name === r.office_name
    )

    if (!selectedOfficeData) {
      setError('Selected office data not found')
      return
    }

    const officeName = offices.find(o => o.id === selectedOffice)?.office_name || 'Unknown Office'

    try {
      generateSWOTPowerPoint(swotAnalysis, officeName, {
        suppliers_count: selectedOfficeData.suppliers_count,
        coordinates: selectedOfficeData.coordinates,
        rank: selectedOfficeData.rank,
        total_offices: analysisResults.length
      })
    } catch (err) {
      setError(`Failed to export PowerPoint: ${err}`)
    }
  }

  // Format AI recommendation for better display
  const formatAIRecommendation = (text: string) => {
    // Clean up the text first - remove any remaining markdown formatting
    let cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
      .replace(/\*(.*?)\*/g, '$1')     // Remove italic markdown
      .replace(/#{1,6}\s*(.*)/g, '$1') // Remove heading markdown
      .trim()

    // Define section patterns to look for
    const sectionPatterns = [
      { key: 'RECOMMENDED OFFICE', icon: '🏆', color: 'emerald' },
      { key: 'KEY FACTORS', icon: '🔑', color: 'blue' },
      { key: 'BUSINESS IMPACT', icon: '📈', color: 'purple' },
      { key: 'RISK ASSESSMENT', icon: '⚠️', color: 'orange' },
      { key: 'IMPLEMENTATION NOTES', icon: '📋', color: 'teal' },
      { key: 'IMPLEMENTATION', icon: '📋', color: 'teal' }
    ]

    // Split text into sections based on patterns
    const sections = []
    let currentSection = null
    let currentContent = []

    const lines = cleanText.split('\n')
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      if (!trimmedLine) continue

      // Check if this line is a section header
      const matchedPattern = sectionPatterns.find(pattern => 
        trimmedLine.toUpperCase().includes(pattern.key.toUpperCase()) && 
        (trimmedLine.includes(':') || trimmedLine.toUpperCase() === pattern.key.toUpperCase())
      )

      if (matchedPattern) {
        // Save previous section if exists
        if (currentSection && currentContent.length > 0) {
          sections.push({
            ...currentSection,
            content: currentContent.join('\n')
          })
        }
        
        // Start new section
        currentSection = matchedPattern
        currentContent = []
      } else {
        // Add content to current section
        currentContent.push(line)
      }
    }

    // Add final section
    if (currentSection && currentContent.length > 0) {
      sections.push({
        ...currentSection,
        content: currentContent.join('\n')
      })
    }

    // If no sections found, treat as single content block
    if (sections.length === 0) {
      sections.push({
        key: 'STRATEGIC RECOMMENDATION',
        icon: '🧠',
        color: 'blue',
        content: cleanText
      })
    }

    // Render sections
    return sections.map((section, index) => {
      return (
        <div
          key={index}
          className="premium-card rounded-2xl p-6 border-l-4 border-accent glow"
        >
          <h4 className="font-bold mb-4 flex items-center gap-3 text-xl gradient-text">
            <span className="text-2xl">{section.icon}</span>
            {section.key.replace(/[_:]/g, ' ')}
          </h4>
          <div className="text-foreground leading-relaxed space-y-3">
            {section.content.split('\n').map((line, idx) => {
              const trimmedLine = line.trim()
              if (!trimmedLine) return null

              // Handle bullet points
              if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
                return (
                  <div key={idx} className="flex items-start gap-3 ml-2">
                    <span className="text-accent mt-1.5 font-bold text-lg">•</span>
                    <span className="flex-1 text-muted-foreground">{trimmedLine.substring(1).trim()}</span>
                  </div>
                )
              }

              // Handle numbered lists
              if (/^\d+\./.test(trimmedLine)) {
                const [number, ...rest] = trimmedLine.split('.')
                return (
                  <div key={idx} className="flex items-start gap-3 ml-2">
                    <span className="text-accent mt-1.5 font-bold min-w-[24px] text-lg">{number}.</span>
                    <span className="flex-1 text-muted-foreground">{rest.join('.').trim()}</span>
                  </div>
                )
              }

              // Regular paragraph
              return (
                <p key={idx} className="leading-relaxed text-muted-foreground">
                  {trimmedLine}
                </p>
              )
            })}
          </div>
        </div>
      )
    })
  }

  const renderSWOTGrid = () => {
    if (!swotAnalysis) return null

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* Strengths */}
        <div className="premium-card rounded-2xl p-6 border-l-4 border-green-500 glow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Shield className="h-5 w-5 text-green-400" />
            </div>
            <h4 className="text-lg font-bold text-green-400">Strengths</h4>
          </div>
          <ul className="space-y-3">
            {swotAnalysis.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-green-400 mt-1 text-lg">•</span>
                <span className="text-muted-foreground leading-relaxed">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="premium-card rounded-2xl p-6 border-l-4 border-red-500 glow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <h4 className="text-lg font-bold text-red-400">Weaknesses</h4>
          </div>
          <ul className="space-y-3">
            {swotAnalysis.weaknesses.map((weakness, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-red-400 mt-1 text-lg">•</span>
                <span className="text-muted-foreground leading-relaxed">{weakness}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Opportunities */}
        <div className="premium-card rounded-2xl p-6 border-l-4 border-blue-500 glow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-400" />
            </div>
            <h4 className="text-lg font-bold text-blue-400">Opportunities</h4>
          </div>
          <ul className="space-y-3">
            {swotAnalysis.opportunities.map((opportunity, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-blue-400 mt-1 text-lg">•</span>
                <span className="text-muted-foreground leading-relaxed">{opportunity}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Threats */}
        <div className="premium-card rounded-2xl p-6 border-l-4 border-orange-500 glow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Target className="h-5 w-5 text-orange-400" />
            </div>
            <h4 className="text-lg font-bold text-orange-400">Threats</h4>
          </div>
          <ul className="space-y-3">
            {swotAnalysis.threats.map((threat, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-orange-400 mt-1 text-lg">•</span>
                <span className="text-muted-foreground leading-relaxed">{threat}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl luxury-gradient flex items-center justify-center glow-strong float">
          <Brain className="h-8 w-8 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold gradient-text mb-2">AI-Powered Business Intelligence</h2>
          <p className="text-muted-foreground text-lg">
            Intelligent recommendations and strategic analysis for office location decisions
          </p>
        </div>
      </div>

      {/* Configuration */}
      <div className="premium-card rounded-2xl p-6">
        <div className="space-y-6">
          {error && (
            <div className="premium-card rounded-xl p-4 border-l-4 border-red-500">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-red-400 mb-1">Error</p>
                  <p className="text-red-300 mb-2">{error}</p>
                  {error.includes('API key') && (
                    <p className="text-xs text-red-400">
                      💡 Add your OpenRouter API key to the .env.local file to enable AI features.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">📊 Dataset</label>
              <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                <SelectTrigger className="glass border-white/10 bg-white/5 focus:border-accent">
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
              <label className="block text-sm font-medium text-foreground mb-3">🏢 Office for SWOT Analysis</label>
              <Select value={selectedOffice} onValueChange={setSelectedOffice}>
                <SelectTrigger className="glass border-white/10 bg-white/5 focus:border-accent">
                  <SelectValue placeholder="Select office for SWOT" />
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
          </div>

          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={handleGenerateRecommendation}
              disabled={generatingRecommendation || analysisResults.length === 0}
              className="luxury-gradient hover:opacity-90 transition-all duration-300 glow flex items-center gap-2"
              size="lg"
            >
              {generatingRecommendation ? (
                <Spinner size="sm" />
              ) : (
                <Lightbulb className="h-4 w-4" />
              )}
              Generate AI Recommendation
            </Button>

            <Button 
              onClick={handleGenerateSWOT}
              disabled={generatingSWOT || !selectedOffice || analysisResults.length === 0}
              variant="outline"
              className="glass border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-300 flex items-center gap-2"
              size="lg"
            >
              {generatingSWOT ? (
                <Spinner size="sm" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              🧠 Generate AI SWOT Analysis
            </Button>
          </div>

          {fetchingContext && (
            <div className="premium-card rounded-xl p-4 border-l-4 border-blue-500">
              <div className="flex items-center gap-3">
                <Spinner size="sm" />
                <span className="text-blue-400 font-medium">Gathering contextual information for AI analysis...</span>
              </div>
            </div>
          )}

          <div className="premium-card rounded-xl p-4 border-l-4 border-blue-500">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Brain className="h-5 w-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-blue-400 mb-2">🤖 AI-Enhanced Analysis</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Our AI will intelligently supplement any missing contextual data (population, infrastructure, etc.) 
                  using its extensive knowledge base to provide comprehensive strategic insights.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendation */}
      {aiRecommendation && (
        <div className="premium-card rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold gradient-text mb-2 flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Lightbulb className="h-5 w-5 text-yellow-400" />
              </div>
              🤖 AI-Powered Strategic Recommendation
            </h3>
            <p className="text-muted-foreground">
              Intelligent analysis and strategic recommendation for optimal office location
            </p>
          </div>
          <div className="space-y-4">
            {formatAIRecommendation(aiRecommendation)}
          </div>
        </div>
      )}

      {/* SWOT Analysis */}
      {swotAnalysis && (
        <div className="premium-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold gradient-text mb-2 flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Wand2 className="h-5 w-5 text-purple-400" />
                </div>
                🧠 AI-Powered SWOT Analysis: {offices.find(o => o.id === selectedOffice)?.office_name}
              </h3>
              <p className="text-muted-foreground">
                AI-driven strategic assessment of strengths, weaknesses, opportunities, and threats
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExportToPowerPoint}
              disabled={!swotAnalysis}
              className="glass border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-300"
            >
              <Download className="h-4 w-4 mr-2" />
              Export to PowerPoint
            </Button>
          </div>

          {/* Summary */}
          <div className="mb-6 premium-card rounded-xl p-4 border-l-4 border-accent">
            <h4 className="font-semibold text-accent mb-3">Executive Summary</h4>
            <p className="text-muted-foreground leading-relaxed">{swotAnalysis.summary}</p>
          </div>

          {/* SWOT Grid */}
          {renderSWOTGrid()}
        </div>
      )}

      {/* Empty States */}
      {datasets.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Brain className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No datasets available</h3>
            <p className="text-muted-foreground">
              Upload supplier data first to enable AI-powered analysis.
            </p>
          </CardContent>
        </Card>
      )}

      {offices.length === 0 && datasets.length > 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Brain className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No offices configured</h3>
            <p className="text-muted-foreground">
              Add potential office locations to generate AI insights.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}