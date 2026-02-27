import { Settings, Zap, BarChart3 } from 'lucide-react'

const steps = [
  {
    step: '01',
    icon: Settings,
    title: 'Configure Your Agent',
    description:
      'Set up your AI agent in minutes. Define its personality, language preferences, call scripts, and business context — no coding required.',
  },
  {
    step: '02',
    icon: Zap,
    title: 'Deploy & Go Live',
    description:
      'Connect your phone number and go live instantly. Your AI agent starts handling calls in Uzbek, English, and Russian around the clock.',
  },
  {
    step: '03',
    icon: BarChart3,
    title: 'Analyze & Optimize',
    description:
      'Review call transcripts, sentiment analysis, and lead data in your dashboard. Continuously improve your agent based on real insights.',
  },
]

export default function HowItWorksSection() {
  return (
    <section className="py-16 md:py-24" id="how-it-works">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl font-semibold md:text-4xl">
            Up and Running in Minutes
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            From setup to your first AI-handled call — it's simpler than you think.
          </p>
        </div>

        <div className="relative">
          {/* Connector line */}
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-border md:block" />

          <div className="space-y-12 md:space-y-0">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`relative flex flex-col md:flex-row items-center gap-8 md:gap-12 ${
                  index % 2 === 1 ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <div
                    className={`${
                      index % 2 === 1 ? 'md:text-right' : 'md:text-left'
                    }`}
                  >
                    <span className="text-6xl font-bold text-muted-foreground/20 leading-none">
                      {step.step}
                    </span>
                    <h3 className="mt-2 text-xl font-semibold">{step.title}</h3>
                    <p className="mt-3 text-muted-foreground max-w-sm mx-auto md:mx-0">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Center icon */}
                <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background shadow-lg">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>

                {/* Spacer for alternating layout */}
                <div className="flex-1 hidden md:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
