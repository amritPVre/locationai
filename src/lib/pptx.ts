import pptxgen from 'pptxgenjs'
import type { SWOTAnalysis } from './ai'

export function generateSWOTPowerPoint(
  swotAnalysis: SWOTAnalysis,
  officeName: string,
  analysisData: {
    suppliers_count: number
    coordinates: string
    rank: number
    total_offices: number
  }
): void {
  // Create new presentation
  const pptx = new pptxgen()

  // Define color scheme
  const colors = {
    primary: '2563EB',
    strengths: '16A34A',
    weaknesses: 'DC2626',
    opportunities: '2563EB',
    threats: 'D97706',
    background: 'F8FAFC',
    text: '1E293B'
  }

  // Slide 1: Title Slide
  const slide1 = pptx.addSlide()
  slide1.background = { color: colors.background }

  slide1.addText('SWOT Analysis', {
    x: 1,
    y: 1.5,
    w: 8,
    h: 1.5,
    fontSize: 44,
    bold: true,
    color: colors.primary,
    align: 'center'
  })

  slide1.addText(`Regional Office Location: ${officeName}`, {
    x: 1,
    y: 3,
    w: 8,
    h: 1,
    fontSize: 24,
    color: colors.text,
    align: 'center'
  })

  slide1.addText(`Analysis Date: ${new Date().toLocaleDateString()}`, {
    x: 1,
    y: 4,
    w: 8,
    h: 0.5,
    fontSize: 16,
    color: colors.text,
    align: 'center'
  })

  // Key metrics box
  slide1.addShape(pptx.ShapeType.rect, {
    x: 2,
    y: 5,
    w: 6,
    h: 1.5,
    fill: { color: 'FFFFFF' },
    line: { color: colors.primary, width: 2 }
  })

  slide1.addText([
    { text: 'Key Metrics\n', options: { fontSize: 16, bold: true, color: colors.primary } },
    { text: `Supplier Coverage: ${analysisData.suppliers_count} suppliers\n`, options: { fontSize: 14, color: colors.text } },
    { text: `Ranking: #${analysisData.rank} out of ${analysisData.total_offices} locations\n`, options: { fontSize: 14, color: colors.text } },
    { text: `Coordinates: ${analysisData.coordinates}`, options: { fontSize: 12, color: colors.text } }
  ], {
    x: 2.2,
    y: 5.2,
    w: 5.6,
    h: 1.1,
    valign: 'top'
  })

  // Slide 2: Executive Summary
  const slide2 = pptx.addSlide()
  slide2.background = { color: colors.background }

  slide2.addText('Executive Summary', {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 1,
    fontSize: 32,
    bold: true,
    color: colors.primary
  })

  slide2.addShape(pptx.ShapeType.rect, {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 4.5,
    fill: { color: 'FFFFFF' },
    line: { color: colors.primary, width: 1 }
  })

  slide2.addText(swotAnalysis.summary, {
    x: 0.8,
    y: 1.8,
    w: 8.4,
    h: 3.9,
    fontSize: 18,
    color: colors.text,
    valign: 'top',
    lineSpacing: 24
  })

  // Slide 3: SWOT Matrix
  const slide3 = pptx.addSlide()
  slide3.background = { color: colors.background }

  slide3.addText('SWOT Analysis Matrix', {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.8,
    fontSize: 28,
    bold: true,
    color: colors.primary,
    align: 'center'
  })

  // Create 2x2 SWOT grid
  const quadrantWidth = 4.25
  const quadrantHeight = 2.8
  const startX = 0.75
  const startY = 1.3

  // Strengths (Top Left)
  slide3.addShape(pptx.ShapeType.rect, {
    x: startX,
    y: startY,
    w: quadrantWidth,
    h: quadrantHeight,
    fill: { color: 'F0FDF4' },
    line: { color: colors.strengths, width: 2 }
  })

  slide3.addText('STRENGTHS', {
    x: startX,
    y: startY + 0.1,
    w: quadrantWidth,
    h: 0.4,
    fontSize: 16,
    bold: true,
    color: colors.strengths,
    align: 'center'
  })

  const strengthsText = swotAnalysis.strengths.map((s, i) => `${i + 1}. ${s}`).join('\n\n')
  slide3.addText(strengthsText, {
    x: startX + 0.1,
    y: startY + 0.5,
    w: quadrantWidth - 0.2,
    h: quadrantHeight - 0.6,
    fontSize: 11,
    color: colors.text,
    valign: 'top'
  })

  // Weaknesses (Top Right)
  slide3.addShape(pptx.ShapeType.rect, {
    x: startX + quadrantWidth + 0.25,
    y: startY,
    w: quadrantWidth,
    h: quadrantHeight,
    fill: { color: 'FEF2F2' },
    line: { color: colors.weaknesses, width: 2 }
  })

  slide3.addText('WEAKNESSES', {
    x: startX + quadrantWidth + 0.25,
    y: startY + 0.1,
    w: quadrantWidth,
    h: 0.4,
    fontSize: 16,
    bold: true,
    color: colors.weaknesses,
    align: 'center'
  })

  const weaknessesText = swotAnalysis.weaknesses.map((w, i) => `${i + 1}. ${w}`).join('\n\n')
  slide3.addText(weaknessesText, {
    x: startX + quadrantWidth + 0.35,
    y: startY + 0.5,
    w: quadrantWidth - 0.2,
    h: quadrantHeight - 0.6,
    fontSize: 11,
    color: colors.text,
    valign: 'top'
  })

  // Opportunities (Bottom Left)
  slide3.addShape(pptx.ShapeType.rect, {
    x: startX,
    y: startY + quadrantHeight + 0.25,
    w: quadrantWidth,
    h: quadrantHeight,
    fill: { color: 'EFF6FF' },
    line: { color: colors.opportunities, width: 2 }
  })

  slide3.addText('OPPORTUNITIES', {
    x: startX,
    y: startY + quadrantHeight + 0.35,
    w: quadrantWidth,
    h: 0.4,
    fontSize: 16,
    bold: true,
    color: colors.opportunities,
    align: 'center'
  })

  const opportunitiesText = swotAnalysis.opportunities.map((o, i) => `${i + 1}. ${o}`).join('\n\n')
  slide3.addText(opportunitiesText, {
    x: startX + 0.1,
    y: startY + quadrantHeight + 0.75,
    w: quadrantWidth - 0.2,
    h: quadrantHeight - 0.6,
    fontSize: 11,
    color: colors.text,
    valign: 'top'
  })

  // Threats (Bottom Right)
  slide3.addShape(pptx.ShapeType.rect, {
    x: startX + quadrantWidth + 0.25,
    y: startY + quadrantHeight + 0.25,
    w: quadrantWidth,
    h: quadrantHeight,
    fill: { color: 'FFFBEB' },
    line: { color: colors.threats, width: 2 }
  })

  slide3.addText('THREATS', {
    x: startX + quadrantWidth + 0.25,
    y: startY + quadrantHeight + 0.35,
    w: quadrantWidth,
    h: 0.4,
    fontSize: 16,
    bold: true,
    color: colors.threats,
    align: 'center'
  })

  const threatsText = swotAnalysis.threats.map((t, i) => `${i + 1}. ${t}`).join('\n\n')
  slide3.addText(threatsText, {
    x: startX + quadrantWidth + 0.35,
    y: startY + quadrantHeight + 0.75,
    w: quadrantWidth - 0.2,
    h: quadrantHeight - 0.6,
    fontSize: 11,
    color: colors.text,
    valign: 'top'
  })

  // Slide 4: Strategic Recommendations
  const slide4 = pptx.addSlide()
  slide4.background = { color: colors.background }

  slide4.addText('Strategic Recommendations', {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 1,
    fontSize: 28,
    bold: true,
    color: colors.primary
  })

  // Leverage Strengths
  slide4.addText('Leverage Strengths:', {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 0.4,
    fontSize: 16,
    bold: true,
    color: colors.strengths
  })

  const topStrengths = swotAnalysis.strengths.slice(0, 2).map(s => `• ${s}`).join('\n')
  slide4.addText(topStrengths, {
    x: 0.5,
    y: 1.9,
    w: 9,
    h: 1,
    fontSize: 12,
    color: colors.text
  })

  // Address Weaknesses
  slide4.addText('Address Weaknesses:', {
    x: 0.5,
    y: 3,
    w: 9,
    h: 0.4,
    fontSize: 16,
    bold: true,
    color: colors.weaknesses
  })

  const topWeaknesses = swotAnalysis.weaknesses.slice(0, 2).map(w => `• ${w}`).join('\n')
  slide4.addText(topWeaknesses, {
    x: 0.5,
    y: 3.4,
    w: 9,
    h: 1,
    fontSize: 12,
    color: colors.text
  })

  // Capitalize on Opportunities
  slide4.addText('Capitalize on Opportunities:', {
    x: 0.5,
    y: 4.5,
    w: 9,
    h: 0.4,
    fontSize: 16,
    bold: true,
    color: colors.opportunities
  })

  const topOpportunities = swotAnalysis.opportunities.slice(0, 2).map(o => `• ${o}`).join('\n')
  slide4.addText(topOpportunities, {
    x: 0.5,
    y: 4.9,
    w: 9,
    h: 1,
    fontSize: 12,
    color: colors.text
  })

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `SWOT_Analysis_${officeName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.pptx`

  // Save the presentation
  pptx.writeFile({ fileName: filename })
}
