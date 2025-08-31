import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Brain, Map, BarChart3, Shield, Zap, Users, CheckCircle, Star, Menu, X } from 'lucide-react'

interface LandingPageProps {
  onGetStarted: () => void
  onPrivacyClick?: () => void
}

export function LandingPage({ onGetStarted, onPrivacyClick }: LandingPageProps) {
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
      title: "AI-Powered Analysis",
      description: "Advanced artificial intelligence provides strategic recommendations and comprehensive SWOT analysis for optimal decision-making."
    },
    {
      icon: Map,
      title: "Interactive Mapping",
      description: "Real-time visualization with supplier density mapping, coverage radius analysis, and geographic insights."
    },
    {
      icon: BarChart3,
      title: "Data-Driven Insights",
      description: "Upload supplier data, analyze coverage patterns, and generate detailed reports with export capabilities."
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade security with user authentication, data encryption, and compliance with privacy regulations."
    },
    {
      icon: Zap,
      title: "Real-Time Processing",
      description: "Lightning-fast analysis with instant results, contextual information enrichment, and live updates."
    },
    {
      icon: Users,
      title: "Multi-User Support",
      description: "Collaborative workspace with user management, shared datasets, and team-based analysis workflows."
    }
  ]

  const benefits = [
    "Reduce location analysis time by 85%",
    "Increase decision accuracy with AI insights",
    "Save $100K+ on suboptimal office placements",
    "Access real-time demographic and infrastructure data",
    "Generate professional reports in minutes",
    "Minimize risk with comprehensive SWOT analysis"
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      title: "VP of Operations, TechFlow Corp",
      image: "https://images.unsplash.com/photo-1494790108755-2616b332c76c?w=64&h=64&fit=crop&crop=face",
      content: "This platform revolutionized our expansion strategy. The AI recommendations helped us choose locations that increased our supplier coverage by 40% while reducing operational costs."
    },
    {
      name: "Michael Rodriguez",
      title: "Director of Strategy, GlobalTrade Inc",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
      content: "The data-driven insights and beautiful visualizations made it easy to present our expansion plans to the board. We secured approval in record time."
    },
    {
      name: "Dr. Emily Watson",
      title: "Chief Analytics Officer, InnovateLabs",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
      content: "The AI-powered SWOT analysis identified risks and opportunities we hadn't considered. It's like having a strategic consultant available 24/7."
    }
  ]

  const stats = [
    { number: "500+", label: "Companies Trust Us" },
    { number: "2M+", label: "Locations Analyzed" },
    { number: "95%", label: "Accuracy Rate" },
    { number: "24/7", label: "Support Available" }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl luxury-gradient flex items-center justify-center glow">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">LocationAI</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('features')} className="text-muted-foreground hover:text-foreground transition-colors">Features</button>
              <button onClick={() => scrollToSection('benefits')} className="text-muted-foreground hover:text-foreground transition-colors">Benefits</button>
              <button onClick={() => scrollToSection('testimonials')} className="text-muted-foreground hover:text-foreground transition-colors">Testimonials</button>
              <button onClick={() => scrollToSection('pricing')} className="text-muted-foreground hover:text-foreground transition-colors">Pricing</button>
              <Button 
                onClick={onGetStarted}
                className="luxury-gradient hover:opacity-90 transition-all duration-300 glow"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 space-y-4">
              <button onClick={() => scrollToSection('features')} className="block text-muted-foreground hover:text-foreground transition-colors text-left w-full">Features</button>
              <button onClick={() => scrollToSection('benefits')} className="block text-muted-foreground hover:text-foreground transition-colors text-left w-full">Benefits</button>
              <button onClick={() => scrollToSection('testimonials')} className="block text-muted-foreground hover:text-foreground transition-colors text-left w-full">Testimonials</button>
              <button onClick={() => scrollToSection('pricing')} className="block text-muted-foreground hover:text-foreground transition-colors text-left w-full">Pricing</button>
              <Button 
                onClick={onGetStarted}
                className="w-full luxury-gradient hover:opacity-90 transition-all duration-300 glow"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold gradient-text leading-tight">
                AI-Powered Regional Office Location Analysis
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                Make data-driven decisions for optimal office placement with advanced AI analytics, 
                real-time mapping, and comprehensive strategic insights.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="luxury-gradient hover:opacity-90 transition-all duration-300 glow-strong text-lg px-8 py-4"
              >
                Start Free Analysis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="glass border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-300 text-lg px-8 py-4"
              >
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold gradient-text">{stat.number}</div>
                  <div className="text-muted-foreground mt-2">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold gradient-text mb-4">
              Powerful Features for Strategic Decisions
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to analyze, visualize, and optimize your regional office locations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="premium-card rounded-2xl p-8 hover:scale-105 transition-all duration-300 glow">
                <div className="mb-6">
                  <div className="w-16 h-16 rounded-2xl luxury-gradient flex items-center justify-center glow mb-4">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold gradient-text mb-6">
                Why Leading Companies Choose LocationAI
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Transform your expansion strategy with data-driven insights and AI-powered recommendations
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
                    <span className="text-foreground text-lg">{benefit}</span>
                  </div>
                ))}
              </div>

              <Button 
                onClick={onGetStarted}
                size="lg"
                className="mt-8 luxury-gradient hover:opacity-90 transition-all duration-300 glow"
              >
                Start Your Analysis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-8">
              <div className="premium-card rounded-2xl p-8 glow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Brain className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">AI-Driven Intelligence</h3>
                    <p className="text-muted-foreground">Smart recommendations based on comprehensive data analysis</p>
                  </div>
                </div>
              </div>

              <div className="premium-card rounded-2xl p-8 glow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Map className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Visual Analytics</h3>
                    <p className="text-muted-foreground">Interactive maps and real-time data visualization</p>
                  </div>
                </div>
              </div>

              <div className="premium-card rounded-2xl p-8 glow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Enterprise Ready</h3>
                    <p className="text-muted-foreground">Bank-grade security and compliance standards</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold gradient-text mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              See how companies are transforming their expansion strategies with LocationAI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="premium-card rounded-2xl p-8 glow hover:scale-105 transition-all duration-300">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-muted-foreground mb-6 leading-relaxed">"{testimonial.content}"</p>
                
                <div className="flex items-center gap-3">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full border-2 border-accent"
                  />
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.title}</div>
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
            <h2 className="text-3xl md:text-5xl font-bold gradient-text mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose the plan that fits your business needs. Start free, upgrade when you're ready.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="premium-card rounded-2xl p-8 text-center">
              <h3 className="text-xl font-bold text-foreground mb-2">Starter</h3>
              <div className="text-3xl font-bold gradient-text mb-4">Free</div>
              <p className="text-muted-foreground mb-6">Perfect for small businesses getting started</p>
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-muted-foreground">Up to 100 suppliers</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-muted-foreground">3 office locations</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-muted-foreground">Basic mapping</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-muted-foreground">Email support</span>
                </li>
              </ul>
              <Button 
                onClick={onGetStarted}
                variant="outline"
                className="w-full glass border-white/20 hover:border-white/40 hover:bg-white/5"
              >
                Start Free
              </Button>
            </div>

            {/* Professional Plan */}
            <div className="premium-card rounded-2xl p-8 text-center border-l-4 border-accent glow-strong relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="px-3 py-1 text-xs font-medium luxury-gradient text-white rounded-full">
                  Most Popular
                </span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Professional</h3>
              <div className="text-3xl font-bold gradient-text mb-4">$49<span className="text-lg text-muted-foreground">/month</span></div>
              <p className="text-muted-foreground mb-6">For growing companies with advanced needs</p>
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-muted-foreground">Unlimited suppliers</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-muted-foreground">Unlimited office locations</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-muted-foreground">AI-powered analysis</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-muted-foreground">Advanced reporting</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-muted-foreground">Priority support</span>
                </li>
              </ul>
              <Button 
                onClick={onGetStarted}
                className="w-full luxury-gradient hover:opacity-90 transition-all duration-300 glow"
              >
                Start Trial
              </Button>
            </div>

            {/* Enterprise Plan */}
            <div className="premium-card rounded-2xl p-8 text-center">
              <h3 className="text-xl font-bold text-foreground mb-2">Enterprise</h3>
              <div className="text-3xl font-bold gradient-text mb-4">Custom</div>
              <p className="text-muted-foreground mb-6">Tailored solutions for large organizations</p>
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-muted-foreground">Everything in Professional</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-muted-foreground">Custom integrations</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-muted-foreground">Dedicated support</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-muted-foreground">On-premise deployment</span>
                </li>
              </ul>
              <Button 
                variant="outline"
                className="w-full glass border-white/20 hover:border-white/40 hover:bg-white/5"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold gradient-text mb-6">
            Ready to Transform Your Location Strategy?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join hundreds of companies using AI-powered analytics for smarter expansion decisions
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onGetStarted}
              size="lg"
              className="luxury-gradient hover:opacity-90 transition-all duration-300 glow-strong text-lg px-8 py-4"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="glass border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-300 text-lg px-8 py-4"
            >
              Schedule Demo
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            No credit card required • Free 14-day trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl luxury-gradient flex items-center justify-center glow">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">LocationAI</span>
              </div>
              <p className="text-muted-foreground">
                AI-powered regional office location analysis for strategic business decisions.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Product</h3>
              <div className="space-y-2">
                <a href="#features" className="block text-muted-foreground hover:text-foreground transition-colors">Features</a>
                <a href="#pricing" className="block text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
                <a href="#demo" className="block text-muted-foreground hover:text-foreground transition-colors">Demo</a>
                <a href="#api" className="block text-muted-foreground hover:text-foreground transition-colors">API</a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <div className="space-y-2">
                <a href="#about" className="block text-muted-foreground hover:text-foreground transition-colors">About</a>
                <a href="#careers" className="block text-muted-foreground hover:text-foreground transition-colors">Careers</a>
                <a href="#contact" className="block text-muted-foreground hover:text-foreground transition-colors">Contact</a>
                <a href="#blog" className="block text-muted-foreground hover:text-foreground transition-colors">Blog</a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
              <div className="space-y-2">
                <button 
                  onClick={onPrivacyClick}
                  className="block text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  Privacy Policy
                </button>
                <a href="#terms" className="block text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
                <a href="#security" className="block text-muted-foreground hover:text-foreground transition-colors">Security</a>
                <a href="#compliance" className="block text-muted-foreground hover:text-foreground transition-colors">Compliance</a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 text-center">
            <p className="text-muted-foreground">
              © 2024 LocationAI. All rights reserved. Built with ❤️ for strategic decision makers.
            </p>
          </div>
        </div>
      </footer>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>
    </div>
  )
}
