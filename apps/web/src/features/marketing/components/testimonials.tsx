import { Quote } from 'lucide-react'

const testimonials = [
  {
    content: 'Callmind transformed how we train. The AI insights are accurate, actionable, and actually help reps close more deals.',
    author: 'Sarah Chen',
    role: 'VP of Sales',
    company: 'TechCorp',
  },
  {
    content: 'We saw a 40% increase in deal closures in the first month. The coaching recommendations are spot-on.',
    author: 'Michael Torres',
    role: 'Sales Director',
    company: 'Growthly',
  },
  {
    content: 'The best investment we\'ve made in our sales stack. Onboarding was seamless and support is exceptional.',
    author: 'Emily Watson',
    role: 'CEO',
    company: 'CloudBase',
  },
]

export function Testimonials() {
  return (
    <section className="section-padding section-border">
      <div className="page-wrap">
        <div className="text-center mb-16">
          <h2 className="mb-4">
            Teams that close more
          </h2>
          <p className="max-w-lg mx-auto">
            See what leaders say about Callmind.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.author}
              className="card p-6"
              style={{ animation: `reveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.1}s both` }}
            >
              {/* Quote icon */}
              <div className="mb-6">
                <Quote className="h-5 w-5 text-[var(--color-accent)]/40" />
              </div>

              <p className="mb-8 leading-relaxed text-sm">
                {testimonial.content}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white font-semibold text-xs">
                  {testimonial.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-medium text-sm">{testimonial.author}</p>
                  <p className="text-xs text-[var(--color-text-dim)]">{testimonial.role}, {testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
