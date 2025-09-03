
import { ArrowLeft } from 'lucide-react'

interface ShippingPolicyProps {
  onBack?: () => void
}

export function ShippingPolicy({ onBack }: ShippingPolicyProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-8">
          {onBack && (
            <button 
              onClick={onBack}
              className="flex items-center text-blue-400 hover:text-blue-300 transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
          )}
          
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Shipping Policy</h1>
          <p className="text-xl text-gray-300">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <div className="prose prose-lg max-w-none text-gray-300">
            
            <h2 className="text-2xl font-bold text-white mb-4">Digital Service Delivery</h2>
            <p>
              Kmlytics is a <strong>Software as a Service (SaaS)</strong> platform that provides location intelligence 
              and business analytics through our web-based application. As a digital service, we do not ship physical products.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Service Access</h2>
            <p>
              Upon successful subscription or registration:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Immediate Access:</strong> Your account is activated instantly</li>
              <li><strong>Global Availability:</strong> Access from anywhere with internet connection</li>
              <li><strong>24/7 Service:</strong> Platform available around the clock</li>
              <li><strong>Cloud-Based:</strong> No downloads or installations required</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Data Export and Reports</h2>
            <p>
              While we don't ship physical products, we do provide:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>PDF Reports:</strong> Downloadable SWOT analysis reports</li>
              <li><strong>Excel Exports:</strong> Data analysis in spreadsheet format</li>
              <li><strong>PNG Maps:</strong> High-resolution map exports</li>
              <li><strong>Instant Download:</strong> All exports available immediately</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Technical Requirements</h2>
            <p>
              To access Kmlytics, you need:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Modern web browser (Chrome, Firefox, Safari, Edge)</li>
              <li>Stable internet connection</li>
              <li>JavaScript enabled</li>
              <li>No additional software installation required</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Service Level Agreement</h2>
            <p>
              We provide:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>99.9% Uptime:</strong> Reliable service availability</li>
              <li><strong>Global CDN:</strong> Fast loading worldwide</li>
              <li><strong>Real-time Support:</strong> During business hours</li>
              <li><strong>Regular Updates:</strong> Continuous feature improvements</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">Contact Information</h2>
            <p>
              For any questions about service delivery or access:
            </p>
            <ul className="list-none mb-4">
              <li><strong>Email:</strong> support@kmlytics.xyz</li>
              <li><strong>Website:</strong> https://kmlytics.xyz</li>
              <li><strong>Response Time:</strong> Within 24 hours</li>
            </ul>

          </div>
        </div>
      </div>
    </div>
  )
}
