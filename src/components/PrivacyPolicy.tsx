import { Button } from '@/components/ui/button'
import { ArrowLeft, Shield, Lock, Eye, UserCheck, Database, Globe } from 'lucide-react'

interface PrivacyPolicyProps {
  onBack: () => void
}

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg luxury-gradient flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold gradient-text">Privacy Policy</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="premium-card rounded-2xl p-8 lg:p-12">
          {/* Title Section */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl luxury-gradient flex items-center justify-center glow-strong">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-muted-foreground">
              Your privacy is our priority. Learn how we protect and handle your data.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Last updated: December 2024
            </p>
          </div>

          {/* Quick Overview */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <Eye className="h-6 w-6 text-accent" />
              Privacy at a Glance
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="premium-card rounded-xl p-6 border-l-4 border-green-500">
                <UserCheck className="h-8 w-8 text-green-400 mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Your Control</h3>
                <p className="text-sm text-muted-foreground">You own your data and can export or delete it anytime.</p>
              </div>
              
              <div className="premium-card rounded-xl p-6 border-l-4 border-blue-500">
                <Lock className="h-8 w-8 text-blue-400 mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Secure Storage</h3>
                <p className="text-sm text-muted-foreground">All data is encrypted and stored securely in compliance with GDPR.</p>
              </div>
              
              <div className="premium-card rounded-xl p-6 border-l-4 border-purple-500">
                <Database className="h-8 w-8 text-purple-400 mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Minimal Collection</h3>
                <p className="text-sm text-muted-foreground">We only collect data necessary for the service to function.</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-12">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Introduction</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Welcome to LocationAI ("we," "our," or "us"). We are committed to protecting your privacy and ensuring 
                  the security of your personal information. This Privacy Policy explains how we collect, use, disclose, 
                  and safeguard your information when you use our Regional Office Location Analysis platform.
                </p>
                <p>
                  By using our service, you agree to the collection and use of information in accordance with this policy. 
                  We will not use or share your information with anyone except as described in this Privacy Policy.
                </p>
              </div>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Information We Collect</h2>
              
              <div className="space-y-6">
                <div className="premium-card rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Personal Information</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Email address (for account creation and authentication)</li>
                    <li>• Name and contact information (if provided)</li>
                    <li>• Company information (optional)</li>
                    <li>• Profile preferences and settings</li>
                  </ul>
                </div>

                <div className="premium-card rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Business Data</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Supplier data files (Excel/CSV uploads)</li>
                    <li>• Office location coordinates and names</li>
                    <li>• Analysis results and configurations</li>
                    <li>• Generated reports and insights</li>
                  </ul>
                </div>

                <div className="premium-card rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Technical Information</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• IP address and device information</li>
                    <li>• Browser type and version</li>
                    <li>• Usage patterns and feature interactions</li>
                    <li>• Performance metrics and error logs</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">How We Use Your Information</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>We use the collected information for the following purposes:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="premium-card rounded-xl p-4">
                    <h4 className="font-semibold text-foreground mb-2">Service Delivery</h4>
                    <p className="text-sm text-muted-foreground">Process your data, generate analyses, and provide AI-powered insights</p>
                  </div>
                  
                  <div className="premium-card rounded-xl p-4">
                    <h4 className="font-semibold text-foreground mb-2">Account Management</h4>
                    <p className="text-sm text-muted-foreground">Maintain your account, authenticate access, and provide support</p>
                  </div>
                  
                  <div className="premium-card rounded-xl p-4">
                    <h4 className="font-semibold text-foreground mb-2">Platform Improvement</h4>
                    <p className="text-sm text-muted-foreground">Analyze usage patterns to enhance features and user experience</p>
                  </div>
                  
                  <div className="premium-card rounded-xl p-4">
                    <h4 className="font-semibold text-foreground mb-2">Communication</h4>
                    <p className="text-sm text-muted-foreground">Send service updates, security alerts, and support responses</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <Lock className="h-6 w-6 text-accent" />
                Data Security
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  We implement industry-standard security measures to protect your personal information:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <Shield className="h-4 w-4 text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Encryption</h4>
                        <p className="text-sm text-muted-foreground">All data is encrypted in transit and at rest using AES-256 encryption</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <Database className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Secure Infrastructure</h4>
                        <p className="text-sm text-muted-foreground">Hosted on enterprise-grade cloud infrastructure with 99.9% uptime</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <UserCheck className="h-4 w-4 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Access Control</h4>
                        <p className="text-sm text-muted-foreground">Multi-factor authentication and role-based access controls</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <Globe className="h-4 w-4 text-orange-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Compliance</h4>
                        <p className="text-sm text-muted-foreground">GDPR, CCPA, and SOC 2 compliant security practices</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Your Privacy Rights</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>You have the following rights regarding your personal information:</p>
                
                <div className="space-y-3 mt-6">
                  <div className="flex items-center gap-3 p-4 premium-card rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <span className="text-green-400 font-bold">✓</span>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">Access:</span>
                      <span className="text-muted-foreground ml-2">Request a copy of your personal data</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 premium-card rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <span className="text-blue-400 font-bold">✓</span>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">Rectification:</span>
                      <span className="text-muted-foreground ml-2">Correct any inaccurate personal data</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 premium-card rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <span className="text-purple-400 font-bold">✓</span>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">Erasure:</span>
                      <span className="text-muted-foreground ml-2">Request deletion of your personal data</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 premium-card rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <span className="text-orange-400 font-bold">✓</span>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">Portability:</span>
                      <span className="text-muted-foreground ml-2">Export your data in a machine-readable format</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Data Retention</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  We retain your personal information only for as long as necessary to provide our services and comply 
                  with legal obligations:
                </p>
                <ul className="space-y-2 ml-6">
                  <li>• Account data: Retained until account deletion</li>
                  <li>• Business data: Retained for the duration of your subscription</li>
                  <li>• Usage logs: Automatically deleted after 90 days</li>
                  <li>• Support communications: Retained for 3 years</li>
                </ul>
              </div>
            </section>

            {/* Third-Party Services */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Third-Party Services</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Our platform integrates with the following third-party services to provide enhanced functionality:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="premium-card rounded-xl p-4">
                    <h4 className="font-semibold text-foreground mb-2">OpenStreetMap Nominatim</h4>
                    <p className="text-sm text-muted-foreground">For reverse geocoding and location data</p>
                  </div>
                  <div className="premium-card rounded-xl p-4">
                    <h4 className="font-semibold text-foreground mb-2">OpenRouter API</h4>
                    <p className="text-sm text-muted-foreground">For AI-powered analysis and recommendations</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Contact Us</h2>
              <div className="premium-card rounded-xl p-6">
                <p className="text-muted-foreground mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Email:</strong> privacy@locationai.com</p>
                  <p><strong>Address:</strong> 123 Innovation Drive, Tech City, TC 12345</p>
                  <p><strong>Data Protection Officer:</strong> dpo@locationai.com</p>
                </div>
              </div>
            </section>

            {/* Updates */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Policy Updates</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
                  the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review 
                  this Privacy Policy periodically for any changes.
                </p>
              </div>
            </section>
          </div>

          {/* Back to Top */}
          <div className="mt-12 pt-8 border-t border-white/10 text-center">
            <Button
              onClick={onBack}
              className="luxury-gradient hover:opacity-90 transition-all duration-300 glow"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Home
            </Button>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
      </div>
    </div>
  )
}
