
import { ArrowLeft } from 'lucide-react'

interface CancellationRefundsProps {
  onBack?: () => void
}

export function CancellationRefunds({ onBack }: CancellationRefundsProps) {
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
          
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Cancellation & Refunds Policy</h1>
          <p className="text-xl text-gray-300">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <div className="prose prose-lg max-w-none text-gray-300">
            
            <h2 className="text-2xl font-bold text-white mb-4">1. Subscription Cancellation</h2>
            <p>
              You may cancel your Kmlytics subscription at any time through your account dashboard or by 
              contacting our support team. Cancellations are effective at the end of your current billing period.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">2. Refund Policy</h2>
            <p>
              We offer a <strong>7-day money-back guarantee</strong> for all paid subscriptions. If you are not 
              satisfied with our service, you may request a full refund within 7 days of your initial purchase.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">3. Refund Process</h2>
            <p>To request a refund, please follow these steps:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Contact our support team at <strong>support@kmlytics.xyz</strong></li>
              <li>Include your account email and reason for refund request</li>
              <li>Allow 3-5 business days for refund processing</li>
              <li>Refunds will be credited to your original payment method</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">4. Prorated Refunds</h2>
            <p>
              After the 7-day money-back guarantee period, we do not offer prorated refunds for partial 
              monthly usage. Your subscription will remain active until the end of your current billing cycle.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">5. Service Credits</h2>
            <p>
              In certain circumstances, we may provide service credits for service interruptions or issues. 
              Service credits are applied to your account and cannot be refunded as cash.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">6. Annual Subscriptions</h2>
            <p>
              Annual subscription refunds are handled on a case-by-case basis. Please contact support for 
              assistance with annual subscription cancellations.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">7. Data Retention</h2>
            <p>
              Upon cancellation, your account data will be retained for 30 days to allow for reactivation. 
              After 30 days, your data may be permanently deleted unless otherwise required by law.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4 mt-8">8. Contact for Cancellations</h2>
            <p>
              For cancellation or refund requests, please contact us:
            </p>
            <ul className="list-none mb-4">
              <li><strong>Email:</strong> support@kmlytics.xyz</li>
              <li><strong>Response Time:</strong> Within 24 hours</li>
              <li><strong>Business Hours:</strong> Monday-Friday, 9 AM - 6 PM (UTC)</li>
            </ul>

          </div>
        </div>
      </div>
    </div>
  )
}
