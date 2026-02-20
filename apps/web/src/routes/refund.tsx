import { createFileRoute } from '@tanstack/react-router'
import { RefreshCw, CreditCard, AlertCircle, Clock } from 'lucide-react'

function RefundPolicy() {
  const lastUpdated = 'February 17, 2026'

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-6 py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Refund Policy</h1>
          <p className="text-muted-foreground">Last Updated: {lastUpdated}</p>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <CreditCard className="h-6 w-6" />
              Overview
            </h2>
            <p>
              At CallMind, we want you to be completely satisfied with our AI
              voice agent platform. This Refund Policy outlines the
              circumstances under which refunds may be issued for subscription
              plans and services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <AlertCircle className="h-6 w-6" />
              No Refunds on Subscription Plans
            </h2>
            <p>
              Due to the nature of our digital services and the immediate
              availability of our AI voice agent platform,{' '}
              <strong>we do not offer refunds on subscription fees</strong> once
              a subscription has been activated or a billing cycle has begun.
            </p>
            <p className="mt-4">This applies to all subscription tiers:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Starter Plan ($69/month or $690/year)</li>
              <li>Professional Plan ($172/month or $1,720/year)</li>
              <li>Business Plan ($345/month or $3,450/year)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Cancellation Policy</h2>
            <p>
              You may cancel your subscription at any time. Here's how it works:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>Monthly Subscriptions:</strong> Cancel anytime. You'll
                retain access until the end of your current billing period.
              </li>
              <li>
                <strong>Yearly Subscriptions:</strong> Cancel anytime. You'll
                retain access until the end of your yearly term. No prorated
                refunds.
              </li>
              <li>
                <strong>Free Plan:</strong> No cancellation needed. You can
                downgrade at any time.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Clock className="h-6 w-6" />
              New Customer Trial Period
            </h2>
            <p>
              <strong>Free Plan:</strong> New users can start with our Free Plan
              (2 calls/month, 1 AI agent) to evaluate our service before
              committing to a paid subscription.
            </p>
            <p className="mt-4">
              We encourage all users to thoroughly test our platform during the
              free trial to ensure CallMind meets their needs before upgrading
              to a paid plan.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Service Interruptions</h2>
            <p>
              In the unlikely event of prolonged service interruptions (downtime
              exceeding 24 hours), affected customers may be eligible for
              account credits proportional to the downtime. This is evaluated on
              a case-by-case basis.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <RefreshCw className="h-6 w-6" />
              Account Credits (Exceptions)
            </h2>
            <p>
              While we don't typically issue refunds, we may offer account
              credits in the following exceptional circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>Billing Errors:</strong> If you were charged in error
                due to a technical issue on our end
              </li>
              <li>
                <strong>Double Billing:</strong> If you were accidentally
                charged multiple times for the same period
              </li>
              <li>
                <strong>Service Not Delivered:</strong> If you paid but couldn't
                access the service due to a platform issue
              </li>
            </ul>
            <p className="mt-4">
              To request an account credit for these reasons, please contact us
              within 30 days of the charge.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Downgrading Your Plan</h2>
            <p>
              You can downgrade to a lower tier or the Free Plan at any time.
              Here's what happens:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                Changes take effect at the end of your current billing period
              </li>
              <li>
                You'll retain access to your current plan features until then
              </li>
              <li>No refund or credit for the difference in price</li>
              <li>
                If downgrading from yearly to monthly, you'll keep yearly
                features until the year ends
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">
              Usage Limits and Overages
            </h2>
            <p>
              Each plan includes a specific number of call credits per month. If
              you exceed your limit:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                You'll need to upgrade to a higher plan to continue using the
                service
              </li>
              <li>Unused credits do not roll over to the next month</li>
              <li>We don't offer prorated refunds for unused credits</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">
              Payment Processor Refunds
            </h2>
            <p>
              All payments are processed through Payme.uz. If you believe you're
              eligible for a refund due to a billing error or unauthorized
              charge, you may also contact Payme directly:
            </p>
            <div className="bg-muted p-4 rounded-lg mt-4">
              <p>
                <strong>Payme Support:</strong>{' '}
                <a
                  href="https://payme.uz/support"
                  className="text-primary underline"
                >
                  https://payme.uz/support
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">
              How to Request Account Credits
            </h2>
            <p>
              If you believe you qualify for an account credit under the
              exceptions above:
            </p>
            <ol className="list-decimal pl-6 space-y-2 mt-2">
              <li>
                Contact our support team at <strong>billing@callmind.uz</strong>
              </li>
              <li>Include your account email and transaction details</li>
              <li>Explain the reason for your request</li>
              <li>We'll review your request within 5-10 business days</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Policy Changes</h2>
            <p>
              We reserve the right to modify this Refund Policy at any time.
              Changes will be posted on this page and take effect immediately.
              Your continued use of our service after changes constitutes
              acceptance of the new policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Contact Us</h2>
            <p>
              If you have questions about this Refund Policy, please contact us:
            </p>
            <div className="bg-muted p-4 rounded-lg mt-4">
              <p>
                <strong>Email:</strong> billing@callmind.uz
              </p>
              <p>
                <strong>Website:</strong> https://callmind.uz
              </p>
            </div>
          </section>

          <section className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Important Notice
            </h2>
            <p className="text-yellow-700 dark:text-yellow-300">
              By subscribing to CallMind, you acknowledge that you have read,
              understood, and agreed to this Refund Policy. If you do not agree
              with these terms, please do not subscribe to our service.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/refund')({ component: RefundPolicy })
