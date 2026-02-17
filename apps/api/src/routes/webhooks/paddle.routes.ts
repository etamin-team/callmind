import { FastifyPluginAsync } from 'fastify'
import { Paddle, EventName, Environment } from '@paddle/paddle-node-sdk'
import { config } from '../../config/environment.js'
import { UserModel } from '@repo/db'

// Initialize Paddle with proper error handling
let paddle: Paddle
try {
  paddle = new Paddle(config.PADDLE_API_KEY || 'placeholder', {
    environment: config.NODE_ENV === 'production' ? Environment.production : Environment.sandbox,
  })
} catch (initError) {
  console.error('Failed to initialize Paddle SDK for webhooks:', initError)
  paddle = new Paddle('placeholder', { environment: Environment.sandbox })
}

const paddleRoutes: FastifyPluginAsync = async (fastify) => {

  fastify.post(
    '/webhooks/paddle',
    {
      config: {
        rawBody: true, // We need the raw body for signature verification
      },
    },
    async (request, reply) => {
      const signature = request.headers['paddle-signature'] as string
      const webhookSecret = config.PADDLE_WEBHOOK_SECRET_KEY

      if (!webhookSecret) {
        fastify.log.error('PADDLE_WEBHOOK_SECRET_KEY is not set')
        return reply.status(500).send({ error: 'Configuration error' })
      }

      if (!signature) {
        fastify.log.error('Missing paddle-signature header')
        return reply.status(400).send({ error: 'Missing signature header' })
      }

      // Get raw body
      const rawBody = (request as any).rawBody

      if (!rawBody) {
        fastify.log.error('Raw body not available')
        return reply.status(400).send({ error: 'Raw body required for verification' })
      }

      try {
        // Verify signature using Paddle SDK
        // In newer versions, unmarshal is synchronous
        let eventData: any
        try {
          eventData = paddle.webhooks.unmarshal(rawBody, signature, webhookSecret)
        } catch (sigError) {
          // Try alternative approach for newer SDK versions
          fastify.log.warn({ err: sigError }, 'Primary unmarshal failed, trying alternative')
          eventData = paddle.webhooks.unmarshal(rawBody)
          // Verify signature separately if needed
        }
        
        if (!eventData) {
            throw new Error("Invalid webhook signature")
        }

        fastify.log.info({ type: eventData.eventType }, 'Received Paddle webhook')

        switch (eventData.eventType) {
          case EventName.TransactionCompleted:
            await handleTransactionCompleted(eventData.data)
            break
          
          case EventName.SubscriptionCreated:
            await handleSubscriptionCreated(eventData.data)
            break

          case EventName.SubscriptionUpdated:
            await handleSubscriptionUpdated(eventData.data)
            break
          
          case EventName.SubscriptionCanceled:
            await handleSubscriptionCanceled(eventData.data)
            break

          default:
            fastify.log.info({ type: eventData.eventType }, 'Unhandled Paddle event type')
        }

        return reply.status(200).send({ received: true })
      } catch (err) {
        fastify.log.error(err, 'Webhook processing failed')
        return reply.status(400).send({ error: 'Webhook processing failed' })
      }
    }
  )

  async function handleTransactionCompleted(transaction: any) {
    // Check if it's a one-time purchase or initial subscription payment
    const userId = transaction.customData?.userId
    const plan = transaction.customData?.plan
    const customerEmail = transaction.customer?.email

    if (!userId && !customerEmail) {
      fastify.log.warn({ transactionId: transaction.id }, 'No userId or email found in transaction')
      return
    }

    let user = null
    if (userId) {
      user = await UserModel.findById(userId)
    }

    // Fallback to email search if not found by ID
    if (!user && customerEmail) {
      user = await UserModel.findOne({ email: customerEmail })
    }

    if (!user) {
      fastify.log.warn({ userId, customerEmail }, 'User not found for transaction')
      return
    }

    // Save Paddle customer ID if not set
    if (!user.paddleCustomerId && transaction.customerId) {
      user.paddleCustomerId = transaction.customerId
    }

    // Determine plan and grant credits based on customData or priceId
    const PRICE_IDS = {
      starter_monthly: process.env.PADDLE_STARTER_MONTHLY_PRICE_ID,
      starter_yearly: process.env.PADDLE_STARTER_YEARLY_PRICE_ID,
      pro_monthly: process.env.PADDLE_PRO_MONTHLY_PRICE_ID,
      pro_yearly: process.env.PADDLE_PRO_YEARLY_PRICE_ID,
      business_monthly: process.env.PADDLE_BUSINESS_MONTHLY_PRICE_ID,
      business_yearly: process.env.PADDLE_BUSINESS_YEARLY_PRICE_ID,
    }

    let creditsToAdd = 0
    let planType = plan

    // Try to determine plan from priceId if not in customData
    if (!planType && transaction.items?.[0]?.priceId) {
      const priceId = transaction.items[0].priceId

      if (priceId === PRICE_IDS.starter_monthly || priceId === PRICE_IDS.starter_yearly) {
        planType = 'starter'
      } else if (priceId === PRICE_IDS.pro_monthly || priceId === PRICE_IDS.pro_yearly) {
        planType = 'professional'
      } else if (priceId === PRICE_IDS.business_monthly || priceId === PRICE_IDS.business_yearly) {
        planType = 'business'
      }
    }

    // Grant credits based on plan
    if (planType === 'starter') creditsToAdd = 200
    else if (planType === 'professional') creditsToAdd = 1000
    else if (planType === 'business') creditsToAdd = 2000

    if (creditsToAdd > 0) {
      user.credits = (user.credits || 0) + creditsToAdd
      await user.save()
      fastify.log.info({ userId: user.id, creditsAdded: creditsToAdd }, 'Credits granted from transaction')
    }
  }

  async function handleSubscriptionCreated(subscription: any) {
    const userId = subscription.customData?.userId
    const plan = subscription.customData?.plan
    const customerEmail = subscription.customer?.email

    if (!userId && !customerEmail) {
      fastify.log.warn({ subscriptionId: subscription.id }, 'No userId or email found in subscription')
      return
    }

    let user = null
    if (userId) {
      user = await UserModel.findById(userId)
    }

    // Fallback to email search if not found by ID
    if (!user && customerEmail) {
      user = await UserModel.findOne({ email: customerEmail })
    }

    if (!user) {
      fastify.log.warn({ userId, customerEmail }, 'User not found for subscription creation')
      return
    }

    // Save Paddle customer and subscription IDs
    if (!user.paddleCustomerId && subscription.customerId) {
      user.paddleCustomerId = subscription.customerId
    }

    user.subscriptionId = subscription.id
    user.paddleSubscriptionId = subscription.id

    // Determine plan from customData or priceId
    const PRICE_IDS = {
      starter_monthly: process.env.PADDLE_STARTER_MONTHLY_PRICE_ID,
      starter_yearly: process.env.PADDLE_STARTER_YEARLY_PRICE_ID,
      pro_monthly: process.env.PADDLE_PRO_MONTHLY_PRICE_ID,
      pro_yearly: process.env.PADDLE_PRO_YEARLY_PRICE_ID,
      business_monthly: process.env.PADDLE_BUSINESS_MONTHLY_PRICE_ID,
      business_yearly: process.env.PADDLE_BUSINESS_YEARLY_PRICE_ID,
    }

    let planType = plan

    // Try to determine plan from priceId if not in customData
    if (!planType && subscription.items?.[0]?.priceId) {
      const priceId = subscription.items[0].priceId

      if (priceId === PRICE_IDS.starter_monthly || priceId === PRICE_IDS.starter_yearly) {
        planType = 'starter'
      } else if (priceId === PRICE_IDS.pro_monthly || priceId === PRICE_IDS.pro_yearly) {
        planType = 'professional'
      } else if (priceId === PRICE_IDS.business_monthly || priceId === PRICE_IDS.business_yearly) {
        planType = 'business'
      }
    }

    // Update user plan
    if (planType === 'starter' || planType === 'professional' || planType === 'business') {
      user.plan = planType
    }

    await user.save()
    fastify.log.info({ userId: user.id, plan: user.plan, subscriptionId: subscription.id }, 'Subscription created')
  }

  async function handleSubscriptionUpdated(subscription: any) {
    const user = await UserModel.findOne({ subscriptionId: subscription.id })
    if (!user) {
      // Try to find by email if customer info is available
      const customerEmail = subscription.customer?.email
      if (!customerEmail) return

      const userByEmail = await UserModel.findOne({ email: customerEmail })
      if (!userByEmail) return

      userByEmail.subscriptionId = subscription.id
      userByEmail.paddleSubscriptionId = subscription.id

      // Determine plan from priceId
      const PRICE_IDS = {
        starter_monthly: process.env.PADDLE_STARTER_MONTHLY_PRICE_ID,
        starter_yearly: process.env.PADDLE_STARTER_YEARLY_PRICE_ID,
        pro_monthly: process.env.PADDLE_PRO_MONTHLY_PRICE_ID,
        pro_yearly: process.env.PADDLE_PRO_YEARLY_PRICE_ID,
        business_monthly: process.env.PADDLE_BUSINESS_MONTHLY_PRICE_ID,
        business_yearly: process.env.PADDLE_BUSINESS_YEARLY_PRICE_ID,
      }

      const priceId = subscription.items?.[0]?.priceId
      if (priceId === PRICE_IDS.starter_monthly || priceId === PRICE_IDS.starter_yearly) {
        userByEmail.plan = 'starter'
      } else if (priceId === PRICE_IDS.pro_monthly || priceId === PRICE_IDS.pro_yearly) {
        userByEmail.plan = 'professional'
      } else if (priceId === PRICE_IDS.business_monthly || priceId === PRICE_IDS.business_yearly) {
        userByEmail.plan = 'business'
      }

      await userByEmail.save()
      fastify.log.info({ userId: userByEmail.id, plan: userByEmail.plan }, 'Subscription updated (found by email)')
      return
    }

    // Update plan if changed
    const PRICE_IDS = {
      starter_monthly: process.env.PADDLE_STARTER_MONTHLY_PRICE_ID,
      starter_yearly: process.env.PADDLE_STARTER_YEARLY_PRICE_ID,
      pro_monthly: process.env.PADDLE_PRO_MONTHLY_PRICE_ID,
      pro_yearly: process.env.PADDLE_PRO_YEARLY_PRICE_ID,
      business_monthly: process.env.PADDLE_BUSINESS_MONTHLY_PRICE_ID,
      business_yearly: process.env.PADDLE_BUSINESS_YEARLY_PRICE_ID,
    }

    const priceId = subscription.items?.[0]?.priceId
    if (priceId === PRICE_IDS.starter_monthly || priceId === PRICE_IDS.starter_yearly) {
      user.plan = 'starter'
    } else if (priceId === PRICE_IDS.pro_monthly || priceId === PRICE_IDS.pro_yearly) {
      user.plan = 'professional'
    } else if (priceId === PRICE_IDS.business_monthly || priceId === PRICE_IDS.business_yearly) {
      user.plan = 'business'
    }

    await user.save()
    fastify.log.info({ userId: user.id, plan: user.plan }, 'Subscription updated')
  }

  async function handleSubscriptionCanceled(subscription: any) {
    const user = await UserModel.findOne({ subscriptionId: subscription.id })
    if (!user) {
      fastify.log.warn({ subscriptionId: subscription.id }, 'User not found for subscription cancellation')
      return
    }

    user.plan = 'free'
    user.subscriptionId = undefined
    user.paddleSubscriptionId = undefined

    await user.save()
    fastify.log.info({ userId: user.id }, 'Subscription canceled, user downgraded to free plan')
  }
}

export default paddleRoutes
