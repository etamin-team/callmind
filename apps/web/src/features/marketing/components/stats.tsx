const stats = [
  {
    value: '10M+',
    label: 'Calls Handled',
  },
  {
    value: '99.9%',
    label: 'Uptime SLA',
  },
  {
    value: '3',
    label: 'Languages Supported',
  },
  {
    value: '60%',
    label: 'Cost Reduction',
  },
]

export default function StatsSection() {
  return (
    <section className="py-12 md:py-16 border-y bg-muted/30">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold tracking-tight md:text-5xl">
                {stat.value}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
