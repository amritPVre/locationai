import jsPDF from 'jspdf'
import type { SWOTAnalysis } from './ai'

// Utility function to split text into lines that fit within a specified width
function splitTextToLines(doc: jsPDF, text: string, maxWidth: number, fontSize: number = 12): string[] {
  doc.setFontSize(fontSize)
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const textWidth = doc.getTextWidth(testLine)
    
    if (textWidth <= maxWidth) {
      currentLine = testLine
    } else {
      if (currentLine) {
        lines.push(currentLine)
        currentLine = word
        // Check if single word is too long for the line
        if (doc.getTextWidth(word) > maxWidth) {
          // Break long word into smaller parts
          const chars = word.split('')
          let partialWord = ''
          for (const char of chars) {
            const testPartial = partialWord + char
            if (doc.getTextWidth(testPartial) <= maxWidth) {
              partialWord = testPartial
            } else {
              if (partialWord) {
                lines.push(partialWord)
                partialWord = char
              }
            }
          }
          currentLine = partialWord
        }
      } else {
        // Single word is too long, break it
        const chars = word.split('')
        let partialWord = ''
        for (const char of chars) {
          const testPartial = partialWord + char
          if (doc.getTextWidth(testPartial) <= maxWidth) {
            partialWord = testPartial
          } else {
            if (partialWord) {
              lines.push(partialWord)
              partialWord = char
            }
          }
        }
        currentLine = partialWord
      }
    }
  }
  
  if (currentLine) {
    lines.push(currentLine)
  }
  
  return lines
}

// Utility function to add text with proper wrapping
function addWrappedText(
  doc: jsPDF, 
  text: string, 
  x: number, 
  y: number, 
  maxWidth: number, 
  fontSize: number = 12,
  lineHeight: number = 6
): number {
  const lines = splitTextToLines(doc, text, maxWidth, fontSize)
  doc.setFontSize(fontSize)
  
  lines.forEach((line, index) => {
    doc.text(line, x, y + (index * lineHeight))
  })
  
  return y + (lines.length * lineHeight) + 2  // Add extra padding at the end
}

// Generate professional SWOT PDF report
export function generateSWOTPDF(
  swotAnalysis: SWOTAnalysis,
  officeName: string,
  analysisData: {
    suppliers_count: number
    coordinates: string
    rank: number
    total_offices: number
  }
): void {
  // Create new PDF document (A4 size)
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = 210
  const pageHeight = 297
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  
  // Professional color scheme
  const colors = {
    primary: [30, 58, 138], // Deep blue
    secondary: [14, 165, 233], // Light blue
    strengths: [5, 150, 105], // Green
    weaknesses: [220, 38, 38], // Red
    opportunities: [37, 99, 235], // Blue
    threats: [217, 119, 6], // Orange
    lightGray: [248, 250, 252],
    darkGray: [55, 65, 81],
    black: [0, 0, 0]
  }

  let currentY = margin

  // PAGE 1: COVER PAGE
  // Header gradient (simulated with rectangles)
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2])
  doc.rect(0, 0, pageWidth, 50, 'F')
  
  // Kmlytics branding
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('Kmlytics', margin, 25)
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Location Intelligence Platform', margin, 35)

  // Main title
  currentY = 70
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2])
  doc.setFontSize(32)
  doc.setFont('helvetica', 'bold')
  const titleWidth = doc.getTextWidth('STRATEGIC SWOT ANALYSIS')
  doc.text('STRATEGIC SWOT ANALYSIS', (pageWidth - titleWidth) / 2, currentY)

  // Office name
  currentY += 20
  const truncatedOfficeName = officeName.length > 50 ? officeName.substring(0, 47) + '...' : officeName
  doc.setFontSize(18)
  doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2])
  const officeText = `Regional Office Location: ${truncatedOfficeName}`
  const officeWidth = doc.getTextWidth(officeText)
  doc.text(officeText, (pageWidth - officeWidth) / 2, currentY)

  // Date
  currentY += 15
  doc.setFontSize(14)
  const dateText = `Generated: ${new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`
  const dateWidth = doc.getTextWidth(dateText)
  doc.text(dateText, (pageWidth - dateWidth) / 2, currentY)

  // Key metrics cards
  currentY += 40
  const cardWidth = 50
  const cardHeight = 30
  const cardSpacing = 10
  const startX = (pageWidth - (3 * cardWidth + 2 * cardSpacing)) / 2
  
  const metrics = [
    { title: 'Suppliers', value: analysisData.suppliers_count.toString() },
    { title: 'Ranking', value: `#${analysisData.rank}` },
    { title: 'Total Analyzed', value: analysisData.total_offices.toString() }
  ]

  metrics.forEach((metric, index) => {
    const x = startX + (index * (cardWidth + cardSpacing))
    
    // Card background
    doc.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2])
    doc.setDrawColor(colors.secondary[0], colors.secondary[1], colors.secondary[2])
    doc.rect(x, currentY, cardWidth, cardHeight, 'FD')
    
    // Card value
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2])
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    const valueWidth = doc.getTextWidth(metric.value)
    doc.text(metric.value, x + (cardWidth - valueWidth) / 2, currentY + 15)
    
    // Card title
    doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2])
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const titleWidth = doc.getTextWidth(metric.title)
    doc.text(metric.title, x + (cardWidth - titleWidth) / 2, currentY + 25)
  })

  // PAGE 2: EXECUTIVE SUMMARY
  doc.addPage()
  currentY = margin

  // Header
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2])
  doc.rect(0, 0, pageWidth, 30, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  const summaryTitleWidth = doc.getTextWidth('Executive Summary')
  doc.text('Executive Summary', (pageWidth - summaryTitleWidth) / 2, 20)

  // Summary content box - increased height for better text display
  currentY = 50
  const boxHeight = 100  // Increased from 80 to 100
  doc.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2])
  doc.setDrawColor(colors.secondary[0], colors.secondary[1], colors.secondary[2])
  doc.rect(margin, currentY, contentWidth, boxHeight, 'FD')

  // Summary text with better formatting
  doc.setTextColor(colors.black[0], colors.black[1], colors.black[2])
  doc.setFont('helvetica', 'normal')
  const summaryText = swotAnalysis.summary.length > 800 
    ? swotAnalysis.summary.substring(0, 797) + '...' 
    : swotAnalysis.summary
  
  addWrappedText(doc, summaryText, margin + 8, currentY + 15, contentWidth - 16, 11, 6.5)

  // Footer
  doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2])
  doc.setFontSize(10)
  doc.setFont('helvetica', 'italic')
  doc.text('Powered by Kmlytics AI', pageWidth - margin - 40, pageHeight - 10)

  // PAGE 3: SWOT MATRIX
  doc.addPage()
  currentY = margin

  // Header
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2])
  doc.rect(0, 0, pageWidth, 30, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  const matrixTitleWidth = doc.getTextWidth('SWOT Analysis Matrix')
  doc.text('SWOT Analysis Matrix', (pageWidth - matrixTitleWidth) / 2, 20)

  // SWOT quadrants - increased height for better text display
  currentY = 50
  const quadrantWidth = (contentWidth - 10) / 2
  const quadrantHeight = 110  // Increased from 90 to 110
  const quadrantGap = 10

  const quadrants = [
    { 
      title: 'STRENGTHS', 
      items: swotAnalysis.strengths, 
      color: colors.strengths, 
      bg: [240, 253, 244], 
      x: margin, 
      y: currentY 
    },
    { 
      title: 'WEAKNESSES', 
      items: swotAnalysis.weaknesses, 
      color: colors.weaknesses, 
      bg: [254, 242, 242], 
      x: margin + quadrantWidth + quadrantGap, 
      y: currentY 
    },
    { 
      title: 'OPPORTUNITIES', 
      items: swotAnalysis.opportunities, 
      color: colors.opportunities, 
      bg: [239, 246, 255], 
      x: margin, 
      y: currentY + quadrantHeight + quadrantGap 
    },
    { 
      title: 'THREATS', 
      items: swotAnalysis.threats, 
      color: colors.threats, 
      bg: [255, 251, 235], 
      x: margin + quadrantWidth + quadrantGap, 
      y: currentY + quadrantHeight + quadrantGap 
    }
  ]

  quadrants.forEach(quadrant => {
    // Background
    doc.setFillColor(quadrant.bg[0], quadrant.bg[1], quadrant.bg[2])
    doc.setDrawColor(quadrant.color[0], quadrant.color[1], quadrant.color[2])
    doc.setLineWidth(1)
    doc.rect(quadrant.x, quadrant.y, quadrantWidth, quadrantHeight, 'FD')

    // Title
    doc.setTextColor(quadrant.color[0], quadrant.color[1], quadrant.color[2])
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    const titleWidth = doc.getTextWidth(quadrant.title)
    doc.text(quadrant.title, quadrant.x + (quadrantWidth - titleWidth) / 2, quadrant.y + 12)

    // Items (limit to top 3 for better formatting)
    doc.setTextColor(colors.black[0], colors.black[1], colors.black[2])
    doc.setFontSize(9)  // Reduced font size for better fit
    doc.setFont('helvetica', 'normal')
    
    let itemY = quadrant.y + 22
    quadrant.items.slice(0, 3).forEach((item) => {
      // Clean and truncate item text - increased length limit
      const cleanItem = item.replace(/^\d+\.\s*|^•\s*|^-\s*/, '')
      const truncatedItem = cleanItem.length > 120 ? cleanItem.substring(0, 117) + '...' : cleanItem
      
      const bulletText = `• ${truncatedItem}`
      const lines = splitTextToLines(doc, bulletText, quadrantWidth - 12, 9)  // More padding and correct font size
      
      lines.forEach((line) => {
        if (itemY < quadrant.y + quadrantHeight - 8) { // More bottom padding
          doc.text(line, quadrant.x + 6, itemY)
          itemY += 5.5  // Better line spacing
        }
      })
      itemY += 4 // Extra spacing between items
    })
  })

  // PAGE 4: STRATEGIC RECOMMENDATIONS
  doc.addPage()
  currentY = margin

  // Header
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2])
  doc.rect(0, 0, pageWidth, 30, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  const recTitleWidth = doc.getTextWidth('Strategic Recommendations')
  doc.text('Strategic Recommendations', (pageWidth - recTitleWidth) / 2, 20)

  // Recommendation sections - increased height for better text display
  currentY = 45
  const sectionHeight = 55  // Increased from 45 to 55
  const sectionGap = 8

  const recommendations = [
    {
      title: '🚀 Leverage Key Strengths',
      color: colors.strengths,
      bg: [240, 253, 244],
      items: swotAnalysis.strengths.slice(0, 2)
    },
    {
      title: '⚠️ Address Critical Weaknesses',
      color: colors.weaknesses,
      bg: [254, 242, 242],
      items: swotAnalysis.weaknesses.slice(0, 2)
    },
    {
      title: '💡 Capitalize on Opportunities',
      color: colors.opportunities,
      bg: [239, 246, 255],
      items: swotAnalysis.opportunities.slice(0, 2)
    },
    {
      title: '🛡️ Mitigate Potential Threats',
      color: colors.threats,
      bg: [255, 251, 235],
      items: swotAnalysis.threats.slice(0, 2)
    }
  ]

  recommendations.forEach((rec, index) => {
    const y = currentY + (index * (sectionHeight + sectionGap))
    
    // Section background
    doc.setFillColor(rec.bg[0], rec.bg[1], rec.bg[2])
    doc.setDrawColor(rec.color[0], rec.color[1], rec.color[2])
    doc.rect(margin, y, contentWidth, sectionHeight, 'FD')

    // Section title
    doc.setTextColor(rec.color[0], rec.color[1], rec.color[2])
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(rec.title, margin + 5, y + 10)

    // Section content
    doc.setTextColor(colors.black[0], colors.black[1], colors.black[2])
    doc.setFontSize(9)  // Reduced font size for better fit
    doc.setFont('helvetica', 'normal')
    
    let textY = y + 20
    rec.items.forEach((item) => {
      const cleanItem = item.replace(/^\d+\.\s*|^•\s*|^-\s*/, '')
      const truncatedItem = cleanItem.length > 140 ? cleanItem.substring(0, 137) + '...' : cleanItem
      const bulletText = `• ${truncatedItem}`
      
      // Use improved text wrapping
      const lines = splitTextToLines(doc, bulletText, contentWidth - 20, 9)
      lines.forEach((line) => {
        if (textY < y + sectionHeight - 5) { // Check if there's space
          doc.text(line, margin + 8, textY)
          textY += 5.5  // Better line spacing
        }
      })
      textY += 2 // Extra spacing between items
    })
  })

  // Professional footer
  doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2])
  doc.setFontSize(9)
  doc.setFont('helvetica', 'italic')
  const footerText = 'Confidential Business Analysis | Powered by Kmlytics AI'
  const footerWidth = doc.getTextWidth(footerText)
  doc.text(footerText, (pageWidth - footerWidth) / 2, pageHeight - 10)

  // Generate professional filename
  const timestamp = new Date().toISOString().split('T')[0]
  const timeStamp = new Date().toTimeString().split(' ')[0].replace(/:/g, '-')
  const cleanOfficeName = officeName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')
  const filename = `Kmlytics_SWOT_Report_${cleanOfficeName}_${timestamp}_${timeStamp}.pdf`

  // Save the PDF
  doc.save(filename)
}
