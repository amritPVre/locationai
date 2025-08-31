import OpenAI from 'openai'

// OpenRouter client setup
const getOpenAIClient = () => {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
  
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured')
  }

  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
  })
}

export interface AnalysisResult {
  office_name: string
  suppliers_count: number
  coordinates: string
  rank: number
}

export interface ContextualData {
  location?: {
    display_name?: string
    city?: string
    state?: string
    country?: string
  }
  railwayStation?: {
    name: string
    distance_km: number
  }
  airport?: {
    name: string
    distance_km: number
  }
  highways?: Array<{
    ref: string
    name?: string
    distance_km: number
  }>
  population?: {
    city: string
    population: number
  }
}

export interface SWOTAnalysis {
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
  summary: string
}

// Generate AI recommendation for best office location
export async function generateAIRecommendation(
  analysisResults: AnalysisResult[],
  contextualData: ContextualData | null,
  radius: number
): Promise<string> {
  const client = getOpenAIClient()

  const contextString = formatContextualData(contextualData)
  const rankingString = formatRankingData(analysisResults)

  const prompt = `You are an expert business analyst specializing in regional office location strategy.

ANALYSIS DATA:
Office ranking by supplier density (within ${radius}km radius):
${rankingString}

CONTEXTUAL INFORMATION:
${contextString}

TASK:
Analyze the data and provide a comprehensive recommendation for the best regional office location. 

IMPORTANT: If any contextual information is missing or incomplete (like population data, infrastructure details), please supplement with your knowledge about the region to provide a complete analysis.

FORMATTING INSTRUCTIONS:
- Do NOT use markdown formatting (*, **, #, etc.)
- Structure your response with clear section headers using simple text
- Use bullet points with simple dashes (-)
- Keep sections well-organized and easy to read
- Avoid any special characters for formatting

Please structure your response with these sections:
RECOMMENDED OFFICE: Clear recommendation with reasoning
KEY FACTORS: Primary factors influencing the decision  
BUSINESS IMPACT: Expected benefits and ROI considerations
RISK ASSESSMENT: Potential challenges and mitigation strategies
IMPLEMENTATION NOTES: Practical considerations for setup

Focus on business value, logistics efficiency, and long-term strategic advantages.`

  try {
    const response = await client.chat.completions.create({
      model: 'deepseek/deepseek-chat-v3.1',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000
    })

    return response.choices[0]?.message?.content || 'Unable to generate recommendation'
  } catch (error) {
    console.error('AI recommendation error:', error)
    throw new Error(`AI recommendation failed: ${error}`)
  }
}

// Generate comprehensive SWOT analysis
export async function generateSWOTAnalysis(
  selectedOffice: AnalysisResult,
  analysisResults: AnalysisResult[],
  contextualData: ContextualData | null,
  radius: number
): Promise<SWOTAnalysis> {
  const client = getOpenAIClient()

  const contextString = formatContextualData(contextualData)
  const rankingString = formatRankingData(analysisResults)
  const officeRank = analysisResults.findIndex(r => r.office_name === selectedOffice.office_name) + 1

  const prompt = `You are a strategic business consultant. Perform a comprehensive SWOT analysis for establishing a regional office at "${selectedOffice.office_name}".

OFFICE DETAILS:
- Location: ${selectedOffice.office_name}
- Coordinates: ${selectedOffice.coordinates}
- Supplier Coverage: ${selectedOffice.suppliers_count} suppliers within ${radius}km
- Ranking: #${officeRank} out of ${analysisResults.length} locations analyzed

COMPARATIVE DATA:
${rankingString}

CONTEXTUAL INFORMATION:
${contextString}

IMPORTANT: If contextual information is missing (like specific population data, economic indicators, infrastructure details), please supplement with your knowledge about this region/city to provide a complete SWOT analysis.

Please provide a structured SWOT analysis in the following JSON format:
{
  "strengths": ["strength 1", "strength 2", "strength 3", "strength 4"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3", "weakness 4"],
  "opportunities": ["opportunity 1", "opportunity 2", "opportunity 3", "opportunity 4"],
  "threats": ["threat 1", "threat 2", "threat 3", "threat 4"],
  "summary": "2-3 sentence overall assessment of this location's viability"
}

Each point should be concise (1-2 sentences) and business-focused. Consider factors like:
- Supplier accessibility and logistics
- Infrastructure and connectivity
- Market potential and competition
- Economic and regulatory environment
- Operational costs and resources
- Strategic positioning and growth potential

Respond ONLY with valid JSON - no additional text or formatting.`

  try {
    console.log('Generating SWOT with prompt:', prompt.substring(0, 200) + '...')
    
    const response = await client.chat.completions.create({
      model: 'deepseek/deepseek-chat-v3.1',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 1200
    })

    const content = response.choices[0]?.message?.content
    console.log('AI Response:', content?.substring(0, 200) + '...')
    
    if (!content) {
      throw new Error('No response from AI')
    }

    // Try to extract JSON from the response (in case AI adds extra text)
    let jsonContent = content
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      jsonContent = jsonMatch[0]
    }

    // Parse JSON response
    try {
      const swotData = JSON.parse(jsonContent)
      
      // Validate structure
      if (!swotData.strengths || !swotData.weaknesses || !swotData.opportunities || !swotData.threats) {
        console.error('Invalid SWOT structure:', swotData)
        throw new Error('Invalid SWOT structure - missing required fields')
      }

      // Ensure all fields are arrays
      if (!Array.isArray(swotData.strengths) || !Array.isArray(swotData.weaknesses) || 
          !Array.isArray(swotData.opportunities) || !Array.isArray(swotData.threats)) {
        console.error('SWOT fields are not arrays:', swotData)
        throw new Error('SWOT fields must be arrays')
      }

      console.log('Successfully parsed SWOT:', swotData)
      return swotData as SWOTAnalysis
    } catch (parseError) {
      console.error('Failed to parse SWOT JSON:', jsonContent, parseError)
      // Fallback to text parsing if JSON fails
      console.log('Falling back to text parsing...')
      return parseTextSWOT(content)
    }
  } catch (error) {
    console.error('SWOT analysis error:', error)
    throw new Error(`SWOT analysis failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Helper function to format contextual data for AI
function formatContextualData(contextualData: ContextualData | null): string {
  if (!contextualData) {
    return "No contextual information available. Please supplement with your knowledge about the region."
  }

  let context = ""

  if (contextualData.location) {
    context += `Location Details:\n`
    context += `- Address: ${contextualData.location.display_name || 'Not available'}\n`
    context += `- City: ${contextualData.location.city || 'Not available'}\n`
    context += `- State: ${contextualData.location.state || 'Not available'}\n`
    context += `- Country: ${contextualData.location.country || 'Not available'}\n\n`
  }

  if (contextualData.population) {
    context += `Population:\n`
    context += `- City: ${contextualData.population.city}\n`
    context += `- Population: ${contextualData.population.population > 0 ? contextualData.population.population.toLocaleString() : 'Data not available'}\n\n`
  } else {
    context += `Population: Data not available (please supplement with your knowledge)\n\n`
  }

  if (contextualData.railwayStation) {
    context += `Nearest Railway Station:\n`
    context += `- Name: ${contextualData.railwayStation.name}\n`
    context += `- Distance: ${contextualData.railwayStation.distance_km} km\n\n`
  } else {
    context += `Railway Station: Not found within search radius\n\n`
  }

  if (contextualData.airport) {
    context += `Nearest Airport:\n`
    context += `- Name: ${contextualData.airport.name}\n`
    context += `- Distance: ${contextualData.airport.distance_km} km\n\n`
  } else {
    context += `Airport: Not found within search radius\n\n`
  }

  if (contextualData.highways && contextualData.highways.length > 0) {
    context += `Major Highways:\n`
    contextualData.highways.forEach(highway => {
      context += `- ${highway.ref}: ${highway.name || 'N/A'} (${highway.distance_km} km)\n`
    })
    context += '\n'
  } else {
    context += `Highways: No major highways found nearby\n\n`
  }

  return context
}

// Helper function to format ranking data
function formatRankingData(results: AnalysisResult[]): string {
  let ranking = "Rank | Office Name | Suppliers in Radius | Coordinates\n"
  ranking += "-".repeat(60) + "\n"
  
  results.forEach((result, index) => {
    ranking += `${index + 1}    | ${result.office_name.padEnd(15)} | ${result.suppliers_count.toString().padEnd(18)} | ${result.coordinates}\n`
  })
  
  return ranking
}

// Fallback function to parse SWOT from text if JSON parsing fails
function parseTextSWOT(content: string): SWOTAnalysis {
  console.log('Parsing text SWOT from content:', content.substring(0, 200) + '...')
  
  const defaultSWOT: SWOTAnalysis = {
    strengths: [
      "Strategic location identified for regional operations",
      "Established supplier network in the vicinity",
      "Access to transportation infrastructure",
      "Potential for operational efficiency"
    ],
    weaknesses: [
      "Market data requires more detailed analysis",
      "Infrastructure assessment needs completion",
      "Competition landscape needs evaluation",
      "Resource requirements need quantification"
    ],
    opportunities: [
      "Growing regional market potential",
      "Expansion possibilities in surrounding areas",
      "Technology adoption opportunities",
      "Strategic partnerships potential"
    ],
    threats: [
      "Market competition from established players",
      "Economic fluctuations affecting operations",
      "Regulatory changes in the region",
      "Supply chain disruption risks"
    ],
    summary: "The location shows strategic potential for regional office establishment with favorable supplier accessibility, though detailed market analysis is recommended for optimal decision-making."
  }

  try {
    // Try to extract SWOT sections from text
    const sections = {
      strengths: extractSection(content, ['strength', 'Strong']),
      weaknesses: extractSection(content, ['weakness', 'Weak']),
      opportunities: extractSection(content, ['opportunit', 'Opportunit']),
      threats: extractSection(content, ['threat', 'Threat'])
    }

    // Use extracted sections if found and not empty, otherwise use defaults
    const result = {
      strengths: sections.strengths.length > 0 ? sections.strengths : defaultSWOT.strengths,
      weaknesses: sections.weaknesses.length > 0 ? sections.weaknesses : defaultSWOT.weaknesses,
      opportunities: sections.opportunities.length > 0 ? sections.opportunities : defaultSWOT.opportunities,
      threats: sections.threats.length > 0 ? sections.threats : defaultSWOT.threats,
      summary: extractSummary(content) || defaultSWOT.summary
    }

    console.log('Text parsing result:', result)
    return result
  } catch (error) {
    console.error('Text parsing failed:', error)
    return defaultSWOT
  }
}

// Helper to extract sections from text
function extractSection(content: string, keywords: string[]): string[] {
  const lines = content.split('\n')
  const sectionLines: string[] = []
  
  let inSection = false
  for (const line of lines) {
    const lowerLine = line.toLowerCase()
    
    if (keywords.some(keyword => lowerLine.includes(keyword))) {
      inSection = true
      continue
    }
    
    if (inSection && line.trim().startsWith('-')) {
      sectionLines.push(line.trim().substring(1).trim())
    } else if (inSection && line.trim() === '') {
      continue
    } else if (inSection && !line.trim().startsWith('-')) {
      break
    }
  }
  
  return sectionLines.length > 0 ? sectionLines : ["Analysis point needs more detailed evaluation"]
}

// Helper to extract summary
function extractSummary(content: string): string | null {
  const lines = content.split('\n')
  const summaryKeywords = ['summary', 'conclusion', 'overall']
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase()
    if (summaryKeywords.some(keyword => line.includes(keyword))) {
      // Get next non-empty line
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].trim()) {
          return lines[j].trim()
        }
      }
    }
  }
  
  return null
}
