import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'

type Testimonial = {
    name: string
    role: string
    image: string
    quote: string
}

const testimonials: Testimonial[] = [
    {
        name: 'Sarah Mitchell',
        role: 'Sales Manager at TechSolutions',
        image: 'https://randomuser.me/api/portraits/women/1.jpg',
        quote: 'Our conversion rate increased by 34% in the first month. The AI suggestions help our new agents sound like seasoned pros within days.',
    },
    {
        name: 'Marcus Chen',
        role: 'Contact Center Director',
        image: 'https://randomuser.me/api/portraits/men/6.jpg',
        quote: "The real-time sentiment detection is a game-changer. We can now spot frustrated customers instantly and de-escalate before it's too late.",
    },
    {
        name: 'Jennifer Lopez',
        role: 'Customer Success Lead',
        image: 'https://randomuser.me/api/portraits/women/7.jpg',
        quote: "Training time for new agents dropped from 6 weeks to 2 weeks. The AI coaching gives them confidence and keeps them on script when it matters most.",
    },
    {
        name: 'David Rodriguez',
        role: 'Inside Sales Rep',
        image: 'https://randomuser.me/api/portraits/men/8.jpg',
        quote: "I was skeptical at first, but the AI suggestions have become my secret weapon. It's like having a top performer whispering in my ear during every call.",
    },
    {
        name: 'Amanda Foster',
        role: 'VP of Sales at CloudNet',
        image: 'https://randomuser.me/api/portraits/women/4.jpg',
        quote: "The analytics dashboard shows us exactly what's working. We identified our top performers' techniques and scaled them across the entire team. Revenue is up 42% quarter over quarter.",
    },
    {
        name: 'Tyler Brooks',
        role: 'Outbound Sales Team Lead',
        image: 'https://randomuser.me/api/portraits/men/2.jpg',
        quote: 'Objection handling used to be our biggest weakness. Now the AI suggests proven responses in real-time, and our close rate has nearly doubled.',
    },
    {
        name: 'Priya Patel',
        role: 'Operations Manager',
        image: 'https://randomuser.me/api/portraits/women/5.jpg',
        quote: "The conversation analytics help us identify coaching opportunities we never saw before. We're developing our team based on data, not guesswork.",
    },
    {
        name: 'Carlos Mendez',
        role: 'Enterprise Account Executive',
        image: 'https://randomuser.me/api/portraits/men/9.jpg',
        quote: 'My confidence on complex enterprise calls has skyrocketed. The AI helps me stay on track, remember key talking points, and handle technical questions like an expert.',
    },
    {
        name: 'Khatab Wedaa',
        role: 'MerakiUI Creator',
        image: 'https://randomuser.me/api/portraits/men/10.jpg',
        quote: "Tailus is an elegant, clean, and responsive tailwind css components it's very helpful to start fast with your project.",
    },
    {
        name: 'Mike Henderson',
        role: 'SaaS Sales Director',
        image: 'https://randomuser.me/api/portraits/men/11.jpg',
        quote: "We've tried other coaching tools, but nothing compares to real-time guidance. The integration was seamless and our team adopted it instantly.",
    },
    {
        name: 'Lisa Thompson',
        role: 'Customer Support Manager',
        image: 'https://randomuser.me/api/portraits/women/12.jpg',
        quote: 'Customer satisfaction scores are up 28% since we started using the AI guidance. Agents feel more prepared and customers feel better understood.',
    },
    {
        name: 'James Wilson',
        role: 'Business Development Representative',
        image: 'https://randomuser.me/api/portraits/men/13.jpg',
        quote: "The AI picks up on buying signals I used to miss. It's helped me identify hot leads and close deals I would have let slip away before."
    },
]

const chunkArray = (array: Testimonial[], chunkSize: number): Testimonial[][] => {
    const result: Testimonial[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize))
    }
    return result
}

const testimonialChunks = chunkArray(testimonials, Math.ceil(testimonials.length / 3))

export default function WallOfLoveSection() {
    return (
        <section>
            <div className="py-16 md:py-32">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="text-center">
                        <h2 className="text-3xl font-semibold">Loved by the Community</h2>
                        <p className="mt-6">Harum quae dolore orrupti aut temporibus ariatur.</p>
                    </div>
                    <div className="mt-8 grid gap-3 sm:grid-cols-2 md:mt-12 lg:grid-cols-3">
                        {testimonialChunks.map((chunk, chunkIndex) => (
                            <div
                                key={chunkIndex}
                                className="space-y-3">
                                {chunk.map(({ name, role, quote, image }, index) => (
                                    <Card key={index}>
                                        <CardContent className="grid grid-cols-[auto_1fr] gap-3 pt-6">
                                            <Avatar className="size-9">
                                                <AvatarImage
                                                    alt={name}
                                                    src={image}
                                                    loading="lazy"
                                                    width="120"
                                                    height="120"
                                                />
                                                <AvatarFallback>ST</AvatarFallback>
                                            </Avatar>

                                            <div>
                                                <h3 className="font-medium">{name}</h3>

                                                <span className="text-muted-foreground block text-sm tracking-wide">{role}</span>

                                                <blockquote className="mt-3">
                                                    <p className="text-gray-700 dark:text-gray-300">{quote}</p>
                                                </blockquote>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
