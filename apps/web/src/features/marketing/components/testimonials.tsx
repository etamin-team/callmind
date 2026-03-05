import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'

type TestimonialData = {
    id: string
    name: string
    image: string
}

const testimonialData: TestimonialData[] = [
    {
        id: 'Dilshod Karimov',
        name: 'Dilshod Karimov',
        image: 'https://randomuser.me/api/portraits/men/1.jpg',
    },
    {
        id: 'Elena Volkov',
        name: 'Elena Volkov',
        image: 'https://randomuser.me/api/portraits/women/2.jpg',
    },
    {
        id: 'Michael Chen',
        name: 'Michael Chen',
        image: 'https://randomuser.me/api/portraits/men/3.jpg',
    },
    {
        id: 'Zarina Ahmedova',
        name: 'Zarina Ahmedova',
        image: 'https://randomuser.me/api/portraits/women/4.jpg',
    },
    {
        id: 'Alex Thompson',
        name: 'Alex Thompson',
        image: 'https://randomuser.me/api/portraits/men/5.jpg',
    },
    {
        id: 'Nadiya Kovalenko',
        name: 'Nadiya Kovalenko',
        image: 'https://randomuser.me/api/portraits/women/6.jpg',
    },
    {
        id: 'Ravshan Rustamov',
        name: 'Ravshan Rustamov',
        image: 'https://randomuser.me/api/portraits/men/7.jpg',
    },
    {
        id: 'Sofia Petrova',
        name: 'Sofia Petrova',
        image: 'https://randomuser.me/api/portraits/women/8.jpg',
    },
    {
        id: 'James Morrison',
        name: 'James Morrison',
        image: 'https://randomuser.me/api/portraits/men/9.jpg',
    },
    {
        id: 'Gulnara Tashpulatova',
        name: 'Gulnara Tashpulatova',
        image: 'https://randomuser.me/api/portraits/women/10.jpg',
    },
    {
        id: 'Dmitri Sokolov',
        name: 'Dmitri Sokolov',
        image: 'https://randomuser.me/api/portraits/men/11.jpg',
    },
    {
        id: 'Layla Ahmed',
        name: 'Layla Ahmed',
        image: 'https://randomuser.me/api/portraits/women/12.jpg',
    },
]

const chunkArray = <T,>(array: T[], chunkSize: number): T[][] => {
    const result: T[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize))
    }
    return result
}

export default function WallOfLoveSection() {
    const { t } = useTranslation()
    
    const testimonials = testimonialData.map(data => ({
        ...data,
        role: t(`marketing.testimonials.items.${data.id}.role`),
        quote: t(`marketing.testimonials.items.${data.id}.quote`),
    }))

    const testimonialChunks = chunkArray(testimonials, Math.ceil(testimonials.length / 3))

    return (
        <section>
            <div className="py-16 md:py-32">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="text-center">
                        <h2 className="text-3xl font-semibold">{t('marketing.testimonials.title')}</h2>
                        <p className="mt-6">{t('marketing.testimonials.subtitle')}</p>
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
