const steps = [
  {
    number: '01',
    title: 'Connect your tools',
    description: 'Integrate with Zoom, Google Meet, Teams in minutes. No engineering required.',
  },
  {
    number: '02',
    title: 'AI analyzes calls',
    description: 'Our AI listens, transcribes, and extracts insights from every conversation.',
  },
  {
    number: '03',
    title: 'Coach and improve',
    description: 'Get personalized feedback. Track progress. Watch win rates climb.',
  },
]

export function HowItWorks() {
  return (
    <section className="section-padding section-border relative overflow-hidden">
      {/* Subtle accent glow */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[var(--color-accent)]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="page-wrap relative z-10">
        <div className="text-center mb-20">
          <h2 className="mb-4">
            Three steps to better calls
          </h2>
          <p className="max-w-lg mx-auto">
            Setup takes minutes. Results start day one.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative"
              style={{ animation: `reveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.12}s both` }}
            >
              {/* Large background number */}
              <div className="text-9xl font-bold absolute -top-4 -left-2 text-[var(--color-accent)]/5 leading-none select-none">
                {step.number}
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-xl mb-3 font-semibold">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
                  {step.description}
                </p>
              </div>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 -right-6 w-12 h-px bg-gradient-to-r from-[var(--color-accent)]/20 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
