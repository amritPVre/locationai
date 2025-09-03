import { Helmet } from 'react-helmet-async'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string[]
  canonicalUrl?: string
  ogImage?: string
  structuredData?: any
  page?: 'home' | 'blog' | 'forum' | 'dashboard' | 'about' | 'privacy' | 'terms' | 'cancellation' | 'contact' | 'shipping' | 'instructions'
}

export function SEOHead({ 
  title = "Kmlytics – The Location Intelligence Platform for Smarter Business Decisions",
  description = "Kmlytics is a modern AI-powered business intelligence platform that helps organizations analyze locations, suppliers, and market opportunities with precision. Make smarter business decisions today.",
  keywords = ["business intelligence analysis", "location intelligence software", "supplier density analytics", "site selection tool", "AI SWOT analysis", "sales territory planning", "office location analysis", "business analytics", "business expansion strategy", "data analytics platform"],
  canonicalUrl = "https://kmlytics.xyz",
  ogImage = "https://kmlytics.xyz/og-image.jpg",
  structuredData,
  page = 'home'
}: SEOHeadProps) {
  
  const fullTitle = page === 'home' ? title : `${title} | Kmlytics`
  
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Kmlytics",
    "alternateName": "Kmlytics Location Intelligence Platform",
    "description": description,
    "url": canonicalUrl,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": "0",
      "priceValidUntil": "2025-12-31",
      "availability": "https://schema.org/InStock"
    },
    "creator": {
      "@type": "Organization",
      "name": "Kmlytics",
      "url": canonicalUrl
    },
    "featureList": [
      "Business Intelligence Analysis",
      "Location Intelligence",
      "Supplier Coverage Analysis", 
      "Office Location Optimization",
      "AI-Powered Recommendations",
      "Data Visualization",
      "Strategic Planning Tools",
      "Real-time Analytics"
    ],
    "screenshot": `${canonicalUrl}/app-demo.gif`
  }

  const organizationStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Kmlytics",
    "url": canonicalUrl,
    "logo": `${canonicalUrl}/logo.png`,
    "description": "Leading location intelligence platform for business analysis and strategic decision making",
    "sameAs": [
      "https://twitter.com/kmlytics",
      "https://linkedin.com/company/kmlytics"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "support@kmlytics.com"
    }
  }

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is business intelligence analysis in location planning?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Business intelligence analysis in location planning involves using data analytics to evaluate potential office locations, analyze supplier coverage, optimize operational efficiency, and make strategic expansion decisions based on comprehensive location intelligence."
        }
      },
      {
        "@type": "Question", 
        "name": "How does Kmlytics help with business analysis?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Kmlytics provides AI-powered location intelligence analysis, supplier coverage optimization, strategic office location recommendations, and comprehensive business analytics to support data-driven expansion decisions."
        }
      },
      {
        "@type": "Question",
        "name": "What are the benefits of location intelligence for businesses?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Location intelligence helps businesses optimize office locations, reduce operational costs, improve supplier coverage, enhance customer accessibility, and make strategic expansion decisions based on comprehensive data analysis."
        }
      }
    ]
  }

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Kmlytics" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />
      
      {/* Favicon */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="Kmlytics" />
      <meta name="theme-color" content="#0891b2" />
      
      {/* Geo Meta Tags */}
      <meta name="geo.region" content="US" />
      <meta name="geo.placename" content="United States" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData || defaultStructuredData)}
      </script>
      
      <script type="application/ld+json">
        {JSON.stringify(organizationStructuredData)}
      </script>
      
      {page === 'home' && (
        <script type="application/ld+json">
          {JSON.stringify(faqStructuredData)}
        </script>
      )}
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      
      {/* Alternate languages (add as needed) */}
      <link rel="alternate" hrefLang="en" href={canonicalUrl} />
      
      {/* Feed discovery */}
      <link rel="alternate" type="application/rss+xml" title="Kmlytics Blog" href={`${canonicalUrl}/blog/rss.xml`} />
    </Helmet>
  )
}
