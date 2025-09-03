import { useEffect } from 'react'

// Preload critical resources
export const preloadCriticalResources = () => {
  // Preload fonts
  const fontPreload = document.createElement('link')
  fontPreload.rel = 'preload'
  fontPreload.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
  fontPreload.as = 'style'
  fontPreload.onload = () => {
    fontPreload.rel = 'stylesheet'
  }
  document.head.appendChild(fontPreload)

  // Preload critical images
  const criticalImages = [
    '/app-demo.gif',
    '/logo.png'
  ]
  
  criticalImages.forEach(src => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = src
    link.as = 'image'
    document.head.appendChild(link)
  })
}

// Lazy load non-critical scripts
export const loadNonCriticalScripts = () => {
  // Google Analytics (delayed load)
  setTimeout(() => {
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID'
    document.head.appendChild(script)
    
    window.dataLayer = window.dataLayer || []
    function gtag(...args: any[]) {
      window.dataLayer.push(args)
    }
    gtag('js', new Date())
    gtag('config', 'GA_MEASUREMENT_ID')
  }, 3000)
}

// Component for performance optimization
export function PageSpeedOptimization() {
  useEffect(() => {
    // Preload critical resources on component mount
    preloadCriticalResources()
    
    // Load non-critical scripts after initial render
    const timer = setTimeout(loadNonCriticalScripts, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  return null // This component doesn't render anything
}

// Image optimization utility
export const optimizeImage = (src: string, width?: number, height?: number, quality = 85) => {
  // In production, you'd use a service like Cloudinary or similar
  // For now, return the original src with WebP fallback
  const supportsWebP = () => {
    const elem = document.createElement('canvas')
    return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0
  }

  if (supportsWebP() && src.includes('.jpg') || src.includes('.png')) {
    return src.replace(/\.(jpg|png)$/, '.webp')
  }
  
  return src
}

// Intersection Observer for lazy loading
export const createLazyLoadObserver = (className = 'lazy-load') => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        const src = img.dataset.src
        if (src) {
          img.src = src
          img.classList.remove('lazy-load')
          observer.unobserve(img)
        }
      }
    })
  }, {
    threshold: 0.1,
    rootMargin: '50px'
  })

  // Observe all images with lazy-load class
  document.querySelectorAll(`.${className}`).forEach((img) => {
    observer.observe(img)
  })

  return observer
}

// Service Worker registration for caching
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        console.log('SW registered: ', registration)
      } catch (registrationError) {
        console.log('SW registration failed: ', registrationError)
      }
    })
  }
}
