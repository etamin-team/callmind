import { AIAgent } from '../types'

// Mock data for demo purposes
export const mockAgents: Array<AIAgent> = [
  {
    id: 'agent-001',
    name: 'Customer Support Pro',
    description: 'Handles general customer inquiries and support requests',
    status: 'active',
    capabilities: ['Customer Support', 'Order Tracking', 'Returns', 'Product Info'],
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-12-20'),
    performance: {
      totalCalls: 1250,
      successRate: 94.2,
      avgResponseTime: 1.8,
      customerSatisfaction: 4.6
    },
    configuration: {
      language: 'English',
      voice: 'professional',
      personality: 'helpful',
      knowledgeBase: ['products', 'policies', 'procedures'],
      escalationThreshold: 0.3
    }
  },
  {
    id: 'agent-002',
    name: 'Sales Assistant',
    description: 'Specialized in product recommendations and sales conversations',
    status: 'active',
    capabilities: ['Product Recommendations', 'Upselling', 'Cross-selling', 'Lead Qualification'],
    model: 'gpt-4',
    temperature: 0.8,
    maxTokens: 1500,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-12-18'),
    performance: {
      totalCalls: 890,
      successRate: 87.5,
      avgResponseTime: 2.1,
      customerSatisfaction: 4.4
    },
    configuration: {
      language: 'English',
      voice: 'friendly',
      personality: 'enthusiastic',
      knowledgeBase: ['products', 'pricing', 'promotions'],
      escalationThreshold: 0.4
    }
  },
  {
    id: 'agent-003',
    name: 'Technical Support',
    description: 'Advanced technical troubleshooting and problem resolution',
    status: 'training',
    capabilities: ['Technical Troubleshooting', 'API Support', 'Integration Help', 'Bug Reports'],
    model: 'gpt-4-turbo',
    temperature: 0.3,
    maxTokens: 3000,
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-12-22'),
    performance: {
      totalCalls: 450,
      successRate: 91.8,
      avgResponseTime: 3.2,
      customerSatisfaction: 4.7
    },
    configuration: {
      language: 'English',
      voice: 'technical',
      personality: 'analytical',
      knowledgeBase: ['technical_docs', 'api_docs', 'troubleshooting'],
      escalationThreshold: 0.2
    }
  }
]

export const agentTemplates = [
  {
    id: 'scenario-high-ticket-sales',
    name: 'High-Ticket Sales',
    description: 'Expert guidance for closing enterprise deals and handling complex objections.',
    category: 'Sales',
    icon: '💰',
    capabilities: ['Objection Handling', 'Value Proposition', 'Price Negotiation', 'Competitor Comparison'],
    recommendedSettings: {
      model: 'gpt-4',
      temperature: 0.4,
      maxTokens: 500,
      configuration: {
        language: 'English',
        voice: 'confident',
        personality: 'persuasive',
        escalationThreshold: 0.2
      }
    }
  },
  {
    id: 'scenario-customer-success',
    name: 'Customer Retention',
    description: 'Analyze sentiment and provide empathy-first talking points for churn prevention.',
    category: 'Support',
    icon: '🤝',
    capabilities: ['Sentiment Analysis', 'Empathy Mapping', 'Crisis De-escalation', 'Retention Offers'],
    recommendedSettings: {
      model: 'gpt-4',
      temperature: 0.6,
      maxTokens: 500,
      configuration: {
        language: 'English',
        voice: 'elegant',
        personality: 'empathetic',
        escalationThreshold: 0.4
      }
    }
  },
  {
    id: 'scenario-tech-troubleshooting',
    name: 'Technical Crisis',
    description: 'Rapid diagnostic guidance for high-pressure technical support calls.',
    category: 'Technical',
    icon: '🔧',
    capabilities: ['Root Cause Analysis', 'Technical Explainer', 'SLA Awareness', 'Knowledge Indexing'],
    recommendedSettings: {
      model: 'gpt-4-turbo',
      temperature: 0.2,
      maxTokens: 700,
      configuration: {
        language: 'English',
        voice: 'professional',
        personality: 'analytical',
        escalationThreshold: 0.1
      }
    }
  },
  {
    id: 'scenario-scheduling-concierge',
    name: 'Consultation Booking',
    description: 'Optimized for high-volume outbound scheduling and lead qualification.',
    category: 'Admin',
    icon: '📅',
    capabilities: ['Calendar Sync', 'Lead Qualification', 'Follow-up Logic', 'CRM Integration'],
    recommendedSettings: {
      model: 'gpt-3.5-turbo',
      temperature: 0.3,
      maxTokens: 300,
      configuration: {
        language: 'English',
        voice: 'friendly',
        personality: 'professional',
        escalationThreshold: 0.5
      }
    }
  }
]
