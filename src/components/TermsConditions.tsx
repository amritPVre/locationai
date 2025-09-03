import React from 'react'
import { ArrowLeft } from 'lucide-react'

interface TermsConditionsProps {
  onBack?: () => void
}

export function TermsConditions({ onBack }: TermsConditionsProps) {
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
          
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Terms and Conditions</h1>
          <p className="text-xl text-gray-300">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <div className="prose prose-lg max-w-none text-gray-300">
            
            <h2 className="text-2xl font-bold text-white mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing and using Kmlytics ("the Service"), you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">2. Service Description</h2>
            <p>
              Kmlytics is a location intelligence platform that provides AI-powered business analysis, 
              supplier density analytics, and strategic location recommendations for businesses and organizations.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">3. User Accounts</h2>
            <p>
              To access certain features of the Service, you must register for an account. You are responsible for:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and complete information</li>
              <li>Promptly updating your account information</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">4. Acceptable Use</h2>
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Upload malicious content or violate any laws</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Use the Service for competitive analysis of our platform</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">5. Subscription Plans</h2>
            <p>
              Kmlytics offers various subscription plans. Subscription fees are billed in advance on a monthly basis. 
              You may cancel your subscription at any time through your account settings.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">6. Data and Privacy</h2>
            <p>
              Your privacy is important to us. Please review our Privacy Policy to understand how we collect, 
              use, and protect your information. By using our Service, you agree to the collection and use of 
              information in accordance with our Privacy Policy.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">7. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are and will remain the exclusive 
              property of Kmlytics. The Service is protected by copyright, trademark, and other laws.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">8. Limitation of Liability</h2>
            <p>
              Kmlytics shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
              including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">9. Termination</h2>
            <p>
              We may terminate or suspend your account and bar access to the Service immediately, without prior notice 
              or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">10. Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms at any time. If a revision is material, 
              we will try to provide at least 30 days' notice prior to any new terms taking effect.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">11. Contact Information</h2>
            <p>
              If you have any questions about these Terms and Conditions, please contact us at:
            </p>
            <ul className="list-none mb-4">
              <li><strong>Email:</strong> support@kmlytics.xyz</li>
              <li><strong>Website:</strong> https://kmlytics.xyz</li>
            </ul>

          </div>
        </div>
      </div>
    </div>
  )
}
