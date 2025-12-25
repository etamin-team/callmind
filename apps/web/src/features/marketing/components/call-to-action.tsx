import { Button } from '@/components/ui/button'
import {Link} from '@tanstack/react-router'

export default function CallToAction() {
  return (
          <section className="py-16 md:py-42">
              <div className="mx-auto max-w-5xl px-6">
                  <div className="rounded-3xl bg-[#387DCD] dark:bg-[#262626] px-8 py-20 text-center shadow-xl">
                      <h2 className="text-balance text-5xl font-bold text-white lg:text-6xl">
                          Try Nia now
                          <br />
                          <span className="text-4xl lg:text-5xl">(psssst: it's free!).</span>
                      </h2>
                      <div className="mt-12">
                          <Button
                              asChild
                              size="lg"
                              className="bg-white text-black hover:bg-gray-100 text-base px-8 py-6 rounded-full">
                              <Link href="/">
                                  <span>Start now for free</span>
                              </Link>
                          </Button>
                      </div>
                  </div>
              </div>
          </section>
      )
}
