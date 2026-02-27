const features = [
  {
    name: 'Real-time coaching',
    description: 'Get live suggestions during calls. Handle objections, ask better questions, and close more deals.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="2" fill="currentColor"/>
      </svg>
    ),
  },
  {
    name: 'Instant transcription',
    description: 'Every word captured perfectly. Search through any call to find exactly what was said.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 12H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 8H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 16H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    name: 'Performance insights',
    description: 'See what top performers do differently. Share best calls across the entire team.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 12L7 8L11 12L15 8L19 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 18L7 14L11 18L15 14L19 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="19" cy="5" r="2" fill="currentColor"/>
      </svg>
    ),
  },
  {
    name: 'CRM integration',
    description: 'Automatically sync calls to Salesforce, HubSpot, and more. No manual data entry.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="13" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="3" y="13" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M17 13V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M13 17H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export function Features() {
  return (
    <section id="features" className="section-padding section-border">
      <div className="page-wrap">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="mb-4">
            Four ways we make your<br />sales calls better
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.name}
              className="card p-6"
              style={{ animation: `reveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.08}s both` }}
            >
              {/* Icon */}
              <div className="w-10 h-10 mb-4 flex items-center justify-center text-[var(--color-accent)]">
                {feature.icon}
              </div>

              <h3 className="text-lg font-semibold mb-2">
                {feature.name}
              </h3>
              <p className="text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
