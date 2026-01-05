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
        name: 'Dilshod Karimov',
        role: 'Call Center Manager at UzbekTel',
        image: 'https://randomuser.me/api/portraits/men/1.jpg',
        quote: 'The Uzbek language support is phenomenal. We can now serve our entire customer base without hiring specialized bilingual agents. Our coverage has expanded by 300%.',
    },
    {
        name: 'Elena Volkov',
        role: 'Operations Director at GlobalConnect',
        image: 'https://randomuser.me/api/portraits/women/2.jpg',
        quote: 'Russian-speaking customers finally get the same quality service as our English base. The AI captures leads perfectly in all three languages and syncs seamlessly with our CRM.',
    },
    {
        name: 'Michael Chen',
        role: 'Founder of QuickLead Pro',
        image: 'https://randomuser.me/api/portraits/men/3.jpg',
        quote: 'Lead collection has never been easier. The AI agents qualify prospects 24/7, collect all the details we need, and only pass hot leads to our sales team. We have doubled our qualified leads.',
    },
    {
        name: 'Zarina Ahmedova',
        role: 'Customer Experience Lead',
        image: 'https://randomuser.me/api/portraits/women/4.jpg',
        quote: 'Sentiment analysis across languages is incredible. We can tell instantly when a customer is frustrated, regardless of whether they are speaking English, Uzbek, or Russian. Response time improved by 60%.',
    },
    {
        name: 'Alex Thompson',
        role: 'Sales Manager at MobileFirst Solutions',
        image: 'https://randomuser.me/api/portraits/men/5.jpg',
        quote: 'Mobile deployment was a game-changer. Our field agents use the AI agents on their phones to handle initial calls, collect customer info, and schedule appointments. Productivity is through the roof.',
    },
    {
        name: 'Nadiya Kovalenko',
        role: 'Support Center Manager',
        image: 'https://randomuser.me/api/portraits/women/6.jpg',
        quote: 'We tested four different solutions before finding this. The trilingual capabilities are authentic—not just basic translation, but true contextual understanding in Uzbek and Russian dialects.',
    },
    {
        name: 'Ravshan Rustamov',
        role: 'CEO of UzCommerce',
        image: 'https://randomuser.me/api/portraits/men/7.jpg',
        quote: 'As a Uzbek business expanding internationally, we needed authentic language support. This solution let us serve local Uzbek customers and international clients with the same quality and efficiency.',
    },
    {
        name: 'Sofia Petrova',
        role: 'Digital Transformation Lead',
        image: 'https://randomuser.me/api/portraits/women/8.jpg',
        quote: 'Implementation was shockingly fast. We had our first AI agent handling Russian customer inquiries within hours. The desktop and mobile sync works flawlessly across our distributed team.',
    },
    {
        name: 'James Morrison',
        role: 'VP of Business Development',
        image: 'https://randomuser.me/api/portraits/men/9.jpg',
        quote: 'The ROI was immediate. We deployed AI agents for after-hours English support, then expanded to Uzbek and Russian markets. Revenue from those regions grew 180% in six months.',
    },
    {
        name: 'Gulnara Tashpulatova',
        role: 'Customer Success Manager',
        image: 'https://randomuser.me/api/portraits/women/10.jpg',
        quote: 'Lead quality improved dramatically. The AI does not just collect names—it qualifies prospects, identifies buying intent, and passes complete customer profiles to our team.',
    },
    {
        name: 'Dmitri Sokolov',
        role: 'Technical Operations Manager',
        image: 'https://randomuser.me/api/portraits/men/11.jpg',
        quote: 'The sentiment analysis accuracy is scary good. It picks up subtle frustration cues in Russian that human agents sometimes miss. Our customer satisfaction scores reflect the difference.',
    },
    {
        name: 'Layla Ahmed',
        role: 'Startup Founder',
        image: 'https://randomuser.me/api/portraits/women/12.jpg',
        quote: 'As a small business, we could not afford a multilingual support team. These AI agents let us punch way above our weight, serving three language markets with enterprise-level quality.',
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
                        <h2 className="text-3xl font-semibold">Trusted by Call Centers Worldwide</h2>
                        <p className="mt-6">See how AI agents are transforming customer engagement across languages and platforms.</p>
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
