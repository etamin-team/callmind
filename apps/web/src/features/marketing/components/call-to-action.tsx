import { Button } from '@/components/ui/button'
import {Link} from '@tanstack/react-router'

export default function CallToAction() {
  return (
          <section className="py-16 md:py-42">
              <div className="mx-auto max-w-5xl px-6">
                  <div className="rounded-3xl bg-[#387DCD] dark:bg-[#262626] px-8 py-20 text-center shadow-xl">
                      <h2 className="text-balance text-5xl font-bold text-white lg:text-6xl">
                          Deploy AI Agents That Speak Your Customers Language
                          <br />
                          <span className="text-4xl lg:text-5xl">Start with 100 free minutes across all three languages.</span>
                      </h2>
                      <div className="mt-12">
                          <Button
                              asChild
                              size="lg"
                              className="bg-white text-black hover:bg-gray-100 text-base px-8 py-6 rounded-full">
                              <Link href="/">
                                  <span>Start Free Trial</span>
                              </Link>
                          </Button>
                      </div>
                  </div>
              </div>
          </section>
      )
}
