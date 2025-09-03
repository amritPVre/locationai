import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  ArrowRight, 
  Brain, 
  Shield, 
  Zap, 
  CheckCircle, 
  Star, 
  Menu, 
  X,
  Sparkles,
  TrendingUp,
  Globe,
  Target,
  MapPin,
  Building,
  Truck,
  Users
} from 'lucide-react'

interface LandingPageProps {
  onGetStarted: () => void
  onPrivacyClick?: () => void
  onBlogClick?: () => void
  onForumClick?: () => void
  onInstructionsClick?: () => void
}

export function LandingPage({ onGetStarted, onPrivacyClick, onBlogClick, onForumClick, onInstructionsClick }: LandingPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMenuOpen(false)
  }

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Intelligence",
      description: "Strategic insights and SWOT analysis for smarter location decisions.",
      gradient: "from-purple-500 to-blue-600"
    },
    {
      icon: Globe,
      title: "Global Mapping Engine",
      description: "Interactive mapping with real-time supplier visualization and coverage analysis.",
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      icon: TrendingUp,
      title: "Predictive Analytics",
      description: "Forecast business outcomes with location optimization and predictive modeling.",
      gradient: "from-cyan-500 to-teal-600"
    },
    {
      icon: Target,
      title: "Precision Targeting",
      description: "Pinpoint optimal office locations with radius analysis and demographic insights.",
      gradient: "from-teal-500 to-green-600"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Military-grade encryption and enterprise-level data protection.",
      gradient: "from-green-500 to-blue-600"
    },
    {
      icon: Zap,
      title: "Lightning Performance", 
      description: "Sub-second analysis with real-time processing and instant visualizations.",
      gradient: "from-orange-500 to-red-600"
    }
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "VP of Operations, TechCorp",
      content: "Kmlytics transformed our expansion strategy. We identified the perfect office location that increased our supplier coverage by 340%.",
      rating: 5,
      avatar: "SC"
    },
    {
      name: "Michael Rodriguez", 
      role: "Strategic Planning Director, GlobalManufacturing",
      content: "The AI insights saved us months of research. The SWOT analysis was incredibly detailed and helped secure board approval instantly.",
      rating: 5,
      avatar: "MR"
    },
    {
      name: "Dr. Emily Watson",
      role: "Chief Strategy Officer, InnovateLogistics",
      content: "Remarkable platform. The mapping visualization and data analytics capabilities are unmatched in the industry.",
      rating: 5,
      avatar: "EW"
    }
  ]

     const pricingPlans = [
     {
       name: "Free",
       price: "$0",
       period: "/forever",
       description: "Perfect for small businesses and startups",
       credits: "10 AI credits/month",
       features: [
         "Up to 100 suppliers",
         "3 office locations", 
         "10 AI recommendations/month",
         "Basic mapping features",
         "Community support"
       ],
       highlighted: false
     },
     {
       name: "Pro",
       price: "$11", 
       originalPrice: "$25",
       period: "/month",
       description: "Ideal for growing companies",
       credits: "1,080 AI credits/month",
       isDiscounted: true,
       features: [
         "Up to 1,000 suppliers",
         "10 office locations",
         "1,080 AI recommendations/month", 
         "Advanced SWOT analysis",
         "Premium mapping features",
         "Priority support",
         "Data export capabilities"
       ],
       highlighted: true
     },
     {
       name: "Enterprise", 
       price: "$108",
       period: "/month",
       description: "For large organizations",
       credits: "10,080 AI credits/month",
       features: [
         "Unlimited suppliers",
         "Unlimited offices", 
         "10,080 AI recommendations/month",
         "Custom AI models",
         "Advanced analytics", 
         "Dedicated account manager",
         "White-label options",
         "API access"
       ],
       highlighted: false
     }
   ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  {/* Dotted trail effect */}
                  <div className="absolute -top-2 -left-2 w-3 h-3 border-2 border-dashed border-cyan-400 rounded-full opacity-60"></div>
                  <div className="absolute -top-4 -left-4 w-2 h-2 bg-cyan-400 rounded-full opacity-40"></div>
                </div>
                <span className="text-xl font-bold text-white">Kmlytics</span>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Features
              </button>
              <button 
                onClick={onBlogClick}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Blog
              </button>
              <button 
                onClick={onForumClick}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Forum
              </button>
              <button 
                onClick={onInstructionsClick}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Help
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Testimonials
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Pricing
              </button>
              <Button 
                onClick={onGetStarted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2"
              >
                Get Started
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/90 backdrop-blur-xl border-b border-white/10">
            <div className="px-4 py-3 space-y-3">
              <button 
                onClick={() => scrollToSection('features')}
                className="block w-full text-left text-gray-300 hover:text-white py-2"
              >
                Features
              </button>
              <button 
                onClick={onBlogClick}
                className="block w-full text-left text-gray-300 hover:text-white py-2"
              >
                Blog
              </button>
              <button 
                onClick={onForumClick}
                className="block w-full text-left text-gray-300 hover:text-white py-2"
              >
                Forum
              </button>
              <button 
                onClick={onInstructionsClick}
                className="block w-full text-left text-gray-300 hover:text-white py-2"
              >
                Help
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')}
                className="block w-full text-left text-gray-300 hover:text-white py-2"
              >
                Testimonials
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="block w-full text-left text-gray-300 hover:text-white py-2"
              >
                Pricing
              </button>
              <Button 
                onClick={onGetStarted}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                Get Started
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hidden SEO Content for Search Engines */}
      <div className="hidden">
        <h2>Advanced Location Intelligence Software for Business Intelligence Analysis</h2>
        <p>Kmlytics provides comprehensive supplier density analytics, site selection tools, AI SWOT analysis, sales territory planning, route optimization algorithms, predictive modeling for strategic planning, competitive positioning analysis, distribution center placement, last-mile delivery analysis, transportation cost modeling, and executive dashboard capabilities with real-time KPIs for data-driven location decisions.</p>
      </div>

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-200">AI-Powered Location Intelligence</span>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <span className="text-sm text-blue-400">Now Live</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-6">
              {/* H1 for SEO - Main heading */}
              <h1 className="sr-only">Kmlytics – The Location Intelligence Platform for Smarter Business Decisions</h1>
              
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-2xl">
                    <MapPin className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                  </div>
                  {/* Enhanced dotted trail effect */}
                  <div className="absolute -top-3 -left-3 w-6 h-6 border-2 border-dashed border-cyan-400 rounded-full opacity-60 animate-pulse"></div>
                  <div className="absolute -top-6 -left-6 w-4 h-4 bg-cyan-400 rounded-full opacity-40"></div>
                  <div className="absolute -top-9 -left-9 w-2 h-2 bg-cyan-300 rounded-full opacity-30"></div>
                </div>
                <span className="text-6xl sm:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Kmlytics
                </span>
              </div>
              
              <div className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-400 leading-tight">
                The Location Intelligence
              </div>
              
              <p className="text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8">
                Transform your strategic decision-making with AI-powered <strong>location intelligence</strong> and 
                <strong>business intelligence analysis</strong>. Make smarter decisions faster.
              </p>
              
              <div className="text-lg text-gray-400 max-w-3xl mx-auto">
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div className="space-y-2">
                    <h3 className="text-cyan-400 font-semibold">AI-Powered Supplier Clustering</h3>
                    <p className="text-sm">Intelligent geographic grouping of suppliers for optimal coverage analysis</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-purple-400 font-semibold">Regional Office Ranking</h3>
                    <p className="text-sm">Data-driven scoring system for strategic location selection</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-green-400 font-semibold">Executive SWOT Reports</h3>
                    <p className="text-sm">Comprehensive strategic analysis with AI-generated insights</p>
                  </div>
                </div>
              </div>
            </div>

                         {/* CTA Button */}
             <div className="flex items-center justify-center pt-8">
               <Button 
                 onClick={onGetStarted}
                 size="lg"
                 className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
               >
                 Start Free Analysis
                 <ArrowRight className="ml-2 w-5 h-5" />
               </Button>
             </div>

            {/* App Demo Visual */}
            <div className="pt-16 max-w-6xl mx-auto">
              <div className="relative group">
                {/* Placeholder for app screenshot/GIF */}
                <div className="relative bg-gradient-to-br from-slate-800/50 to-blue-900/30 backdrop-blur-sm rounded-2xl border border-white/10 p-4 hover:border-white/20 transition-all duration-500 group-hover:scale-[1.02]">
                  {/* Browser Chrome */}
                  <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-white/10">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="flex-1 bg-white/5 rounded-lg px-4 py-1 text-sm text-gray-400 text-center">
                      https://locationai.vercel.app
                    </div>
                  </div>
                  
                  {/* App Demo GIF */}
                  <div className="aspect-video bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl border border-white/5 relative overflow-hidden">
                    <img 
                      src="/app-demo.gif" 
                      alt="Kmlytics Dashboard Demo"
                      className="w-full h-full object-cover rounded-xl"
                    />
                    
                    {/* Overlay Text on Hover */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="text-center text-white">
                        <div className="text-sm font-medium mb-2">🚀 Kmlytics in Action</div>
                        <div className="text-xs text-gray-300">Real-time analysis with AI-powered insights</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Feature highlights */}
                  <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-sm">
                    <div className="flex items-center space-x-2 text-gray-300">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>Real-time Mapping</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span>AI Recommendations</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span>Coverage Analysis</span>
                    </div>
                  </div>
                </div>

                {/* Floating elements for visual appeal */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pt-16 max-w-5xl mx-auto">
              {[
                { value: "10,000+", label: "Locations Analyzed" },
                { value: "95%", label: "Accuracy Rate" },
                { value: "500+", label: "Companies Trust Us" },
                { value: "1.2M+", label: "AI Credits Used" },
                { value: "24/7", label: "AI Processing" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Strategic Solutions
              <span className="block bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                For Every Industry
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover how leading organizations leverage location intelligence for competitive advantage.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* For Corporates */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-orange-400/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-6">
                <Building className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">For Corporates</h3>
              <p className="text-gray-300 mb-6">
                Optimize office placement with comprehensive <strong>business intelligence analysis</strong> and competitive positioning insights.
              </p>
              <ul className="space-y-2 text-gray-400">
                <li>• Executive dashboard with real-time KPIs</li>
                <li>• Multi-location cost-benefit analysis</li>
                <li>• Regulatory compliance mapping</li>
                <li>• Stakeholder accessibility scoring</li>
              </ul>
            </div>

            {/* For Logistics Companies */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-blue-400/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-6">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">For Logistics Companies</h3>
              <p className="text-gray-300 mb-6">
                Master <strong>supplier density analytics</strong> and optimize distribution networks with AI-powered route planning.
              </p>
              <ul className="space-y-2 text-gray-400">
                <li>• Route optimization algorithms</li>
                <li>• Distribution center placement</li>
                <li>• Last-mile delivery analysis</li>
                <li>• Transportation cost modeling</li>
              </ul>
            </div>

            {/* For Consultants */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-400/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">For Consultants</h3>
              <p className="text-gray-300 mb-6">
                Deliver premium <strong>site selection tool</strong> services with professional-grade analytics and <strong>AI SWOT analysis</strong>.
              </p>
              <ul className="space-y-2 text-gray-400">
                <li>• White-label reporting platform</li>
                <li>• Client-specific branding options</li>
                <li>• Automated insight generation</li>
                <li>• Export to PDF/Excel</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Business Intelligence Analysis
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Powered by Advanced AI Technology
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the future of location intelligence with our cutting-edge platform
              designed for modern businesses.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div 
                  key={index}
                  className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-2"
                >
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
                  
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Sales Territory Planning
              <span className="block bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Trusted by Industry Leaders Worldwide
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              See how forward-thinking companies are transforming their location strategy with Kmlytics.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                {/* Stars */}
                <div className="flex space-x-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                {/* Content */}
                <p className="text-gray-300 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                
                {/* Author */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{testimonial.name}</div>
                    <div className="text-gray-400 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              AI SWOT Analysis
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Choose Your Perfect Plan
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Scale with confidence. From startups to enterprises, we have the right solution for your business.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index}
                className={`relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border transition-all duration-300 hover:-translate-y-2 flex flex-col h-full ${
                  plan.highlighted 
                    ? 'border-blue-500 bg-gradient-to-br from-blue-500/10 to-purple-500/10' 
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Plan header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-300 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center mb-2">
                    {plan.isDiscounted ? (
                      <div className="text-center">
                        <div className="flex items-baseline justify-center gap-2">
                          <span className="text-2xl text-gray-400 line-through">{plan.originalPrice}</span>
                          <span className="text-4xl font-bold text-blue-400">{plan.price}</span>
                          <span className="text-gray-300">{plan.period}</span>
                        </div>
                        <div className="text-sm text-orange-400 font-medium mt-1">
                          🔥 Limited Time Offer - Save 56%!
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-white">{plan.price}</span>
                        <span className="text-gray-300 ml-2">{plan.period}</span>
                      </>
                    )}
                  </div>
                  <div className="mt-3 px-3 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full text-sm text-blue-300 inline-block">
                    {plan.credits}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button - Fixed alignment */}
                <div className="mt-auto">
                  <Button 
                    onClick={plan.name === 'Free' ? onGetStarted : () => alert('🚧 Payment Integration Coming Soon!\n\nWe are working hard to bring you the best payment experience. Stay tuned for updates!')}
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                      plan.name === 'Free'
                        ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                        : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    }`}
                    disabled={plan.name !== 'Free'}
                  >
                    {plan.name === 'Free' ? 'Get Started' : 'Coming Soon'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -top-2 -left-2 w-3 h-3 border-2 border-dashed border-cyan-400 rounded-full opacity-60"></div>
                  <div className="absolute -top-4 -left-4 w-2 h-2 bg-cyan-400 rounded-full opacity-40"></div>
                </div>
                <span className="text-xl font-bold text-white">Kmlytics</span>
              </div>
              <p className="text-gray-400">
                The location intelligence for strategic business decisions.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => scrollToSection('features')}>Features</button></li>
                <li><button onClick={() => scrollToSection('pricing')}>Pricing</button></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button 
                    onClick={onPrivacyClick}
                    className="hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GDPR</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-400">
                © 2024 Kmlytics. All rights reserved.
              </p>
              <div className="flex items-center space-x-6 text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Status</a>
                <a href="#" className="hover:text-white transition-colors">Support</a>
                <a href="#" className="hover:text-white transition-colors">Documentation</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}