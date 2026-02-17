import { createFileRoute } from '@tanstack/react-router'
import { FileText, AlertTriangle, Gavel, Users } from 'lucide-react'

function TermsOfService() {
  const lastUpdated = "February 17, 2026"

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-6 py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last Updated: {lastUpdated}</p>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Agreement to Terms
            </h2>
            <p>
              By accessing or using CallMind ("Service"), you agree to be bound by these Terms of Service ("Terms").
              If you disagree with any part of these terms, you may not access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <AlertTriangle className="h-6 w-6" />
              Age Requirement
            </h2>
            <p>
              You must be at least 18 years old to use this Service. By using this Service, you represent and warrant
              that you are at least 18 years old.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Accounts and Registration</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You are responsible for maintaining the confidentiality of your account password</li>
              <li>You are responsible for all activities that occur under your account</li>
              <li>You agree to notify us immediately of any unauthorized use of your account</li>
              <li>You must provide accurate, current, and complete information during registration</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Subscription Plans and Billing</h2>
            <h3 className="text-xl font-semibold mt-4">Pricing</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Free Plan:</strong> 2 calls/month, 1 AI agent, basic features</li>
              <li><strong>Starter Plan:</strong> $69/month, 200 calls/month, 3 AI agents</li>
              <li><strong>Professional Plan:</strong> $172/month, 1,000 calls/month, 10 AI agents</li>
              <li><strong>Business Plan:</strong> $345/month, 2,000 calls/month, 25 AI agents</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4">Billing and Renewals</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Subscriptions are billed monthly or yearly as selected</li>
              <li>Your subscription will automatically renew unless cancelled</li>
              <li>Prices are subject to change with 30 days notice</li>
              <li>Payment is processed through Paddle</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Usage Limits and Credits</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Each plan has a monthly call credit limit</li>
              <li>Unused credits do not roll over to the next month</li>
              <li>Exceeding your limit requires upgrading to a higher plan</li>
              <li>"Super realistic calls" are limited based on your plan tier</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Acceptable Use Policy</h2>
            <p>You agree NOT to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Violate any laws in your jurisdiction</li>
              <li>Transmit spam, unsolicited emails, or messages</li>
              <li>Impersonate any person or entity</li>
              <li>Use the Service to harass, abuse, or harm others</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the Service to compete with CallMind</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Gavel className="h-6 w-6" />
              Intellectual Property
            </h2>
            <p>
              The Service and its original content, features, and functionality are owned by CallMind and are
              protected by international copyright, trademark, and other intellectual property laws.
            </p>
            <p>
              You retain ownership of any content you create using our AI agents, including call transcripts
              and recordings. However, you grant us a license to store, process, and use this data to provide
              the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Termination</h2>
            <p>
              We may terminate or suspend your account and access to the Service immediately, without prior
              notice, for any breach of these Terms.
            </p>
            <p>Upon termination, your right to use the Service will immediately cease.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Disclaimer of Warranties</h2>
            <p>
              The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express
              or implied, including but not limited to implied warranties of merchantability, fitness for a
              particular purpose, or non-infringement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Limitation of Liability</h2>
            <p>
              In no event shall CallMind be liable for any indirect, incidental, special, consequential, or
              punitive damages, including without limitation, loss of profits, data, use, goodwill, or other
              intangible losses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Users className="h-6 w-6" />
              Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of Uzbekistan, without
              regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify you of any changes by
              posting the new Terms on this page. Your continued use of the Service after such modifications
              constitutes your acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Contact Information</h2>
            <p>If you have any questions about these Terms, please contact us:</p>
            <div className="bg-muted p-4 rounded-lg mt-4">
              <p><strong>Email:</strong> legal@callmind.uz</p>
              <p><strong>Website:</strong> https://callmind.uz</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/terms')({ component: TermsOfService })
