import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowLeft,
  FileSpreadsheet,
  Upload,
  MapPin,
  Brain,
  Download,
  Play,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'

interface InstructionsProps {
  onBack: () => void
}

export function Instructions({ onBack }: InstructionsProps) {
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    {
      title: "Getting Started",
      icon: Play,
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-blue-500/30">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Info className="w-5 h-5 mr-2 text-blue-400" />
              Welcome to Kmlytics!
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Kmlytics is your AI-powered business intelligence platform for strategic location analysis. 
              Follow these simple steps to transform your business expansion strategy with data-driven insights.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-3">What You'll Accomplish:</h4>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-400" /> Upload supplier data (Excel/CSV)</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-400" /> Define potential office locations</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-400" /> Analyze supplier coverage patterns</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-400" /> Generate AI-powered recommendations</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-400" /> Export strategic insights</li>
              </ul>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-3">Time Investment:</h4>
              <ul className="space-y-2 text-gray-300">
                <li>📊 <strong>Data Preparation:</strong> 10-15 minutes</li>
                <li>📍 <strong>Location Setup:</strong> 5-10 minutes</li>
                <li>🧠 <strong>AI Analysis:</strong> 2-3 minutes</li>
                <li>📈 <strong>Review Results:</strong> 15-20 minutes</li>
                <li><strong className="text-cyan-400">Total Time: ~45 minutes</strong></li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Data Upload Guide",
      icon: Upload,
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-cyan-600/20 to-teal-600/20 rounded-xl p-6 border border-cyan-500/30">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <FileSpreadsheet className="w-5 h-5 mr-2 text-cyan-400" />
              Supplier Data Requirements
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Required Format */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-4">📋 Required Excel/CSV Format</h4>
              <div className="bg-slate-800 rounded-lg p-4 font-mono text-sm">
                <div className="text-cyan-400 mb-2">Column Headers (exactly as shown):</div>
                <div className="text-white space-y-1">
                  <div><span className="text-yellow-400">supplier_name</span> | <span className="text-gray-400">Text</span></div>
                  <div><span className="text-yellow-400">supplier_coords</span> | <span className="text-gray-400">Coordinates</span></div>
                </div>
              </div>
              
              <div className="mt-4 space-y-3">
                <div className="text-sm text-gray-300">
                  <strong className="text-white">Column 1:</strong> <code className="bg-slate-700 px-2 py-1 rounded">supplier_name</code>
                  <br />Business or supplier name (e.g., "ABC Manufacturing Corp")
                </div>
                <div className="text-sm text-gray-300">
                  <strong className="text-white">Column 2:</strong> <code className="bg-slate-700 px-2 py-1 rounded">supplier_coords</code>
                  <br />Coordinates in format: <code className="text-cyan-400">latitude,longitude</code>
                </div>
              </div>
            </div>

            {/* Example Data */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-4">📊 Example Data Format</h4>
              <div className="bg-slate-800 rounded-lg p-4 overflow-x-auto">
                <table className="w-full text-sm font-mono">
                  <thead>
                    <tr className="text-cyan-400 border-b border-slate-600">
                      <th className="text-left pb-2">supplier_name</th>
                      <th className="text-left pb-2">supplier_coords</th>
                    </tr>
                  </thead>
                  <tbody className="text-white space-y-1">
                    <tr>
                      <td className="py-1">Tech Solutions Inc</td>
                      <td className="py-1 text-green-400">40.7128,-74.0060</td>
                    </tr>
                    <tr>
                      <td className="py-1">Global Manufacturing</td>
                      <td className="py-1 text-green-400">34.0522,-118.2437</td>
                    </tr>
                    <tr>
                      <td className="py-1">Supply Chain Pro</td>
                      <td className="py-1 text-green-400">41.8781,-87.6298</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="text-sm text-green-400 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Latitude: -90 to +90 (North/South)
                </div>
                <div className="text-sm text-green-400 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Longitude: -180 to +180 (East/West)
                </div>
                <div className="text-sm text-green-400 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Format: latitude,longitude (comma-separated)
                </div>
              </div>
            </div>
          </div>

          {/* Common Issues */}
          <div className="bg-red-600/10 border border-red-500/30 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-red-400 mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Common Issues to Avoid
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-300">❌ <strong>Wrong column names</strong> (case-sensitive)</div>
                <div className="text-sm text-gray-300">❌ <strong>Missing coordinates</strong> (empty cells)</div>
                <div className="text-sm text-gray-300">❌ <strong>Wrong coordinate format</strong> (spaces, wrong delimiter)</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-300">❌ <strong>Invalid coordinates</strong> (out of range)</div>
                <div className="text-sm text-gray-300">❌ <strong>Extra columns</strong> (only 2 columns supported)</div>
                <div className="text-sm text-gray-300">❌ <strong>Non-UTF8 encoding</strong> (use UTF-8)</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Office Setup",
      icon: MapPin,
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6 border border-purple-500/30">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-purple-400" />
              Setting Up Office Locations
            </h3>
            <p className="text-gray-300">
              Define up to 6 potential office locations for comprehensive coverage analysis. Each location will be evaluated 
              against your supplier network to determine optimal positioning.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">📍 Location Input Methods</h4>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <h5 className="font-semibold text-cyan-400 mb-2">Method 1: Click on Map</h5>
                <p className="text-sm text-gray-300">
                  Simply click anywhere on the interactive map to place an office marker. 
                  Coordinates will be automatically captured.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <h5 className="font-semibold text-purple-400 mb-2">Method 2: Manual Entry</h5>
                <p className="text-sm text-gray-300">
                  Enter coordinates manually in the format: <code className="bg-slate-700 px-2 py-1 rounded text-yellow-400">40.7128,-74.0060</code>
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <h5 className="font-semibold text-green-400 mb-2">Method 3: Address Search</h5>
                <p className="text-sm text-gray-300">
                  Type any address, city, or landmark. Our geocoding service will find the exact coordinates.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">⚙️ Configuration Options</h4>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <h5 className="font-semibold text-white mb-3">Coverage Radius</h5>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• <strong>Default:</strong> 50 km radius</li>
                  <li>• <strong>Range:</strong> 10-200 km adjustable</li>
                  <li>• <strong>Purpose:</strong> Define supplier accessibility zone</li>
                </ul>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <h5 className="font-semibold text-white mb-3">Office Naming</h5>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• <strong>Descriptive names:</strong> "Downtown Seattle Office"</li>
                  <li>• <strong>Geographic identifiers:</strong> "North Region HQ"</li>
                  <li>• <strong>Strategic labels:</strong> "Expansion Site Alpha"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Analysis & Results",
      icon: Brain,
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-600/20 to-teal-600/20 rounded-xl p-6 border border-green-500/30">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-green-400" />
              Understanding Your Analysis Results
            </h3>
            <p className="text-gray-300">
              Kmlytics generates comprehensive business intelligence analysis including coverage metrics, 
              AI recommendations, and strategic SWOT analysis for data-driven decision making.
            </p>
          </div>

          <div className="space-y-6">
            {/* Coverage Analysis */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-4">📊 Coverage Analysis Metrics</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg">
                    <span className="text-gray-300">Suppliers Covered</span>
                    <span className="text-cyan-400 font-bold">85/120</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg">
                    <span className="text-gray-300">Coverage Percentage</span>
                    <span className="text-green-400 font-bold">70.8%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg">
                    <span className="text-gray-300">Avg Distance</span>
                    <span className="text-purple-400 font-bold">23.4 km</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-sm text-gray-300">
                    <strong className="text-white">Coverage %:</strong> Percentage of suppliers within your defined radius
                  </div>
                  <div className="text-sm text-gray-300">
                    <strong className="text-white">Avg Distance:</strong> Mean distance to all covered suppliers
                  </div>
                  <div className="text-sm text-gray-300">
                    <strong className="text-white">Ranking Score:</strong> Comprehensive score based on coverage, accessibility, and strategic factors
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-4">🧠 AI-Powered Insights</h4>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h5 className="font-semibold text-blue-400 mb-2">Strategic Recommendations</h5>
                  <p className="text-sm text-gray-300">
                    AI analyzes your data against demographic information, transportation networks, 
                    and economic indicators to provide strategic office location recommendations.
                  </p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <h5 className="font-semibold text-purple-400 mb-2">SWOT Analysis</h5>
                  <p className="text-sm text-gray-300">
                    Comprehensive Strengths, Weaknesses, Opportunities, and Threats analysis 
                    for each potential office location with actionable insights.
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h5 className="font-semibold text-green-400 mb-2">Contextual Intelligence</h5>
                  <p className="text-sm text-gray-300">
                    Automatic enrichment with nearby railways, airports, highways, and population data 
                    for comprehensive location intelligence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Export & Reports",
      icon: Download,
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-xl p-6 border border-orange-500/30">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Download className="w-5 h-5 mr-2 text-orange-400" />
              Export Your Strategic Insights
            </h3>
            <p className="text-gray-300">
              Transform your analysis into professional reports for stakeholders, executives, and strategic planning sessions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Excel Export */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileSpreadsheet className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-white mb-2">Excel Export</h4>
              <p className="text-sm text-gray-300 mb-4">
                Download complete analysis results as Excel spreadsheet with multiple tabs for different insights.
              </p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Coverage metrics by office</li>
                <li>• Supplier distribution data</li>
                <li>• Distance calculations</li>
                <li>• Ranking comparisons</li>
              </ul>
            </div>

            {/* PDF Export */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Download className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-white mb-2">PDF SWOT Report</h4>
              <p className="text-sm text-gray-300 mb-4">
                Professional SWOT analysis presentation ready for executive meetings and strategic planning sessions.
              </p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Executive summary slide</li>
                <li>• 2x2 SWOT matrix</li>
                <li>• Strategic recommendations</li>
                <li>• Supporting data charts</li>
              </ul>
            </div>

            {/* CSV Export */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileSpreadsheet className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-white mb-2">CSV Data</h4>
              <p className="text-sm text-gray-300 mb-4">
                Raw data export for further analysis in your preferred business intelligence tools and databases.
              </p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Raw supplier coordinates</li>
                <li>• Coverage calculations</li>
                <li>• Distance matrices</li>
                <li>• Compatible with Tableau, Power BI</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-gray-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-2 -left-2 w-3 h-3 border-2 border-dashed border-cyan-400 rounded-full opacity-60"></div>
                <div className="absolute -top-4 -left-4 w-2 h-2 bg-cyan-400 rounded-full opacity-40"></div>
              </div>
              <span className="text-2xl font-bold text-white">Kmlytics</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto rounded-2xl luxury-gradient flex items-center justify-center glow-strong mb-6">
            <Info className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold gradient-text mb-4">
            How to Use Kmlytics
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Complete guide to mastering business intelligence analysis with our AI-powered location intelligence platform.
          </p>
        </div>

        {/* Step Navigation */}
        <div className="flex justify-center mb-12">
          <div className="flex space-x-4 bg-white/5 backdrop-blur-sm rounded-2xl p-2 border border-white/10">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <button
                  key={index}
                  onClick={() => setActiveStep(index)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                    activeStep === index
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{step.title}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-6xl mx-auto">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
                          <CardTitle className="text-2xl text-white flex items-center">
              {(() => {
                const Icon = steps[activeStep].icon
                return Icon ? <Icon className="w-6 h-6 mr-3 text-cyan-400" /> : null
              })()}
              {steps[activeStep].title}
            </CardTitle>
            </CardHeader>
            <CardContent>
              {steps[activeStep].content}
            </CardContent>
          </Card>
        </div>

        {/* Quick Tips */}
        <div className="mt-16 bg-gradient-to-r from-yellow-600/10 to-orange-600/10 rounded-2xl p-8 border border-yellow-500/30">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">💡 Pro Tips for Best Results</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <FileSpreadsheet className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-white mb-2">Clean Data</h4>
              <p className="text-sm text-gray-300">Ensure your supplier data is accurate and complete for optimal analysis results.</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-white mb-2">Strategic Locations</h4>
              <p className="text-sm text-gray-300">Choose diverse potential office locations to maximize coverage options and insights.</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-white mb-2">AI Insights</h4>
              <p className="text-sm text-gray-300">Leverage AI recommendations and SWOT analysis for comprehensive strategic planning.</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Download className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-white mb-2">Export Results</h4>
              <p className="text-sm text-gray-300">Download professional reports for stakeholder presentations and strategic documentation.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
