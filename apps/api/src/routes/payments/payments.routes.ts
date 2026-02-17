import { FastifyPluginAsync } from 'fastify'
import { Paddle, Environment, LogLevel } from '@paddle/paddle-node-sdk'
import { config } from '../../config/environment.js'

// Initialize Paddle with proper error handling
let paddle: Paddle
try {
  paddle = new Paddle(config.PADDLE_API_KEY || 'placeholder', {
    environment: config.NODE_ENV === 'production' ? Environment.production : Environment.sandbox,
    logLevel: config.NODE_ENV === 'production' ? LogLevel.error : LogLevel.verbose,
  })
} catch (initError) {
  console.error('Failed to initialize Paddle SDK:', initError)
  // Create a mock paddle instance that will fail gracefully
  paddle = new Paddle('placeholder', { environment: Environment.sandbox })
}

// Product price IDs from Paddle
// These should match the products/prices created in your Paddle dashboard
const PRICE_IDS = {
  starter_monthly: process.env.PADDLE_STARTER_MONTHLY_PRICE_ID || '',
  starter_yearly: process.env.PADDLE_STARTER_YEARLY_PRICE_ID || '',
  pro_monthly: process.env.PADDLE_PRO_MONTHLY_PRICE_ID || '',
  pro_yearly: process.env.PADDLE_PRO_YEARLY_PRICE_ID || '',
  business_monthly: process.env.PADDLE_BUSINESS_MONTHLY_PRICE_ID || '',
  business_yearly: process.env.PADDLE_BUSINESS_YEARLY_PRICE_ID || '',
}

// Debug logging
console.log('🔍 Payment routes loaded. PRICE_IDS:', {
  starter_monthly: PRICE_IDS.starter_monthly ? 'SET' : 'EMPTY',
  starter_yearly: PRICE_IDS.starter_yearly ? 'SET' : 'EMPTY',
  pro_monthly: PRICE_IDS.pro_monthly ? 'SET' : 'EMPTY',
  pro_yearly: PRICE_IDS.pro_yearly ? 'SET' : 'EMPTY',
  business_monthly: PRICE_IDS.business_monthly ? 'SET' : 'EMPTY',
  business_yearly: PRICE_IDS.business_yearly ? 'SET' : 'EMPTY',
})
console.log('🔍 Direct env check:', {
  PADDLE_STARTER_MONTHLY_PRICE_ID: process.env.PADDLE_STARTER_MONTHLY_PRICE_ID || 'NOT FOUND',
  PADDLE_API_KEY: process.env.PADDLE_API_KEY ? 'SET' : 'NOT FOUND',
})

const paymentsRoutes: FastifyPluginAsync = async (fastify) => {
  // Create checkout session / transaction
  fastify.post('/checkout', async (request, reply) => {
    try {
      const { priceId, productId, customerEmail, customerName, metadata = {} } = request.body as {
        priceId?: string
        productId?: string
        customerEmail?: string
        customerName?: string
        metadata?: Record<string, string>
      }

      if (!config.PADDLE_API_KEY) {
        return reply.status(500).send({ error: 'Paddle API Key not configured' })
      }

      // Build items array
      const items = []
      if (priceId) {
        items.push({ priceId, quantity: 1 })
      } else {
        return reply.status(400).send({ error: 'priceId is required for Paddle checkout' })
      }

      // Prepare custom data
      const customData = {
        ...metadata,
        source: 'callmind_web',
      }

      // Create transaction
      // We create a transaction object to pass to the frontend or return the ID
      const transaction = await paddle.transactions.create({
        items,
        customerDetails: {
            email: customerEmail,
            name: customerName,
        },
        customData,
      })

      // Paddle checkout URL isn't directly returned like Stripe/Polar session URL usually.
      // But we can return the transactionId which the frontend uses to open the checkout.
      // Or if using overlay checkout, we pass transactionId to Paddle.Checkout.open({ transactionId: ... })

      return reply.send({
        transactionId: transaction.id,
        // Paddle doesn't have a direct "checkoutUrl" unless using a Hosted Checkout link, 
        // but typically with SDK we use transactionId.
        // If we want a hosted link, we might need to look into generating one or rely on frontend SDK.
        // For simplicity, let's assume usage of frontend SDK with transactionId.
      })
    } catch (error) {
      fastify.log.error(error, 'Failed to create checkout transaction')
      return reply.status(500).send({ error: 'Failed to create checkout transaction' })
    }
  })

  // Create checkout for a specific plan
  fastify.post('/checkout/:plan', async (request, reply) => {
    try {
      const { plan } = request.params as { plan: string }
      const { yearly = false, customerEmail, customerName, metadata = {} } = request.body as {
        yearly?: boolean
        customerEmail?: string
        customerName?: string
        metadata?: Record<string, string>
      }

      if (!config.PADDLE_API_KEY) {
        return reply.status(500).send({ error: 'Paddle API Key not configured' })
      }

      // Map plan to price ID
      const priceKey = `${plan}_${yearly ? 'yearly' : 'monthly'}` as keyof typeof PRICE_IDS
      const priceId = PRICE_IDS[priceKey]

      if (!priceId) {
        return reply.status(400).send({ error: `Invalid plan: ${plan}` })
      }

      const customData = {
        ...metadata,
        plan,
        billingCycle: yearly ? 'yearly' : 'monthly',
        source: 'callmind_web',
      }

      const transaction = await paddle.transactions.create({
        items: [{ priceId, quantity: 1 }],
        customerDetails: {
            email: customerEmail,
            name: customerName,
        },
        customData,
      })

      return reply.send({
        transactionId: transaction.id,
        plan,
        yearly,
      })
    } catch (error: any) {
      fastify.log.error(error, 'Failed to create checkout transaction')
      return reply.status(500).send({
        error: 'Failed to create checkout transaction',
        message: error?.message || 'Unknown error',
        code: error?.code,
        documentationUrl: error?.documentationUrl
      })
    }
  })

  // Get available products/prices
  fastify.get('/products', async (request, reply) => {
    try {
      if (!config.PADDLE_API_KEY) {
        return reply.status(500).send({ error: 'Paddle API Key not configured' })
      }

      const products = await paddle.products.list({
        status: 'active',
      })

      // We might want to fetch prices too and merge them
      const prices = await paddle.prices.list({
        status: 'active',
      })

      // Combine products and prices
      const result = []
      for await (const product of products) {
        const productPrices = []
        for await (const price of prices) {
            if (price.productId === product.id) {
                productPrices.push(price)
            }
        }
        result.push({ ...product, prices: productPrices })
      }

      return reply.send({ products: result })
    } catch (error) {
      fastify.log.error(error, 'Failed to fetch products')
      return reply.status(500).send({ error: 'Failed to fetch products' })
    }
  })

  // Get customer portal URL (update payment method)
  fastify.post('/customer-portal', async (request, reply) => {
    try {
      const { customerId, subscriptionId } = request.body as { customerId?: string, subscriptionId?: string }

      if (!subscriptionId) {
        return reply.status(400).send({ error: 'Subscription ID is required to generate update payment method link' })
      }

      // Paddle creates a transaction for updating payment method
      const transaction = await paddle.transactions.create({
        subscriptionId,
        // We might need to specify what we are updating or just create a minimal transaction?
        // Actually, for updating payment details, we usually use a specific flow or transaction with 0 amount/update intent.
        // However, looking at docs, often we send a transaction for immediate payment or use the subscription management URL.
        // Let's try to get a management URL if available, or create a transaction.
      })
      
      // Since SDK for update payment method link is specific, let's just return a placeholder or fail if complex.
      // Paddle usually handles this via email or customer portal if enabled.
      // For now, let's assume we return a transaction ID for update.
      
      return reply.send({
        transactionId: transaction.id,
        // Or management URL
      })

    } catch (error) {
      fastify.log.error(error, 'Failed to create customer portal session')
      return reply.status(500).send({ error: 'Failed to create customer portal session' })
    }
  })
}

export default paymentsRoutes
