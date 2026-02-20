import { createFileRoute } from '@tanstack/react-router'
import { Shield, Eye, Cookie, Trash2, Mail } from 'lucide-react'

function PrivacyPolicy() {
  const lastUpdated = 'February 17, 2026'

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-6 py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last Updated: {lastUpdated}</p>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Introduction
            </h2>
            <p>
              Welcome to CallMind ("we," "our," or "us"). We are committed to
              protecting your personal information and your right to privacy.
              This Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you use our AI voice agent
              platform.
            </p>
            <p>
              By using CallMind, you agree to the collection and use of
              information in accordance with this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Eye className="h-6 w-6" />
              Information We Collect
            </h2>

            <h3 className="text-xl font-semibold mt-4">Personal Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Account Information:</strong> Name, email address, and
                password you provide when registering
              </li>
              <li>
                <strong>Payment Information:</strong> Billing details processed
                securely through Payme.uz
              </li>
              <li>
                <strong>Profile Information:</strong> Name, avatar, and other
                optional profile details
              </li>
            </ul>

            <h3 className="text-xl font-semibold mt-4">Usage Data</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Call transcripts and recordings</li>
              <li>Agent configurations and settings</li>
              <li>API usage metrics and logs</li>
              <li>IP address and device information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">
              How We Use Your Information
            </h2>
            <p>We use the collected information for various purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide, maintain, and improve our services</li>
              <li>To process transactions and send billing information</li>
              <li>To send technical notices and support messages</li>
              <li>
                To respond to comments, questions, and customer service requests
              </li>
              <li>To monitor and analyze usage patterns and trends</li>
              <li>
                To detect, prevent, and address technical issues and security
                threats
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Cookie className="h-6 w-6" />
              Cookies and Tracking
            </h2>
            <p>
              We use cookies and similar tracking technologies to track activity
              on our service and hold certain information. Cookies are files
              with small amount of data which may include an anonymous unique
              identifier.
            </p>
            <p>
              You can instruct your browser to refuse all cookies or to indicate
              when a cookie is being sent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Data Sharing</h2>
            <p>
              We may share your personal information in the following
              situations:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>With Service Providers:</strong> Third-party companies
                that perform services on our behalf
              </li>
              <li>
                <strong>With Payment Processors:</strong> Payme.uz processes
                payments securely
              </li>
              <li>
                <strong>For Business Transfers:</strong> In connection with
                merger, sale, or transfer of assets
              </li>
              <li>
                <strong>With Your Consent:</strong> With your explicit consent
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Trash2 className="h-6 w-6" />
              Data Retention and Deletion
            </h2>
            <p>
              We retain your personal information for as long as necessary to
              provide our services and fulfill the transactions you have
              requested. You may request deletion of your data by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Data Security</h2>
            <p>
              We implement appropriate technical and organizational security
              measures to protect your personal information against unauthorized
              or unlawful processing, accidental loss, destruction, or damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Mail className="h-6 w-6" />
              Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us:
            </p>
            <div className="bg-muted p-4 rounded-lg mt-4">
              <p>
                <strong>Email:</strong> privacy@callmind.uz
              </p>
              <p>
                <strong>Website:</strong> https://callmind.uz
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/privacy')({ component: PrivacyPolicy })
