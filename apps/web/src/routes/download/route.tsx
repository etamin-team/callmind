import { createFileRoute } from '@tanstack/react-router'
import { HeroHeader } from '@/features/marketing/components/header'
import FooterSection from '@/features/marketing/components/footer'
import { Button } from '@/components/ui/button'
import { Laptop, Monitor } from 'lucide-react'

export const Route = createFileRoute('/download')({
  component: DownloadPage,
})

function DownloadPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <HeroHeader />
      
      <main className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 text-balance"
            style={{ fontFamily: 'Geist, sans-serif' }}
          >
            Download the CallMind
            <br />
            desktop app
          </h1>
          <p 
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-balance leading-relaxed"
            style={{ fontFamily: 'Geist, sans-serif' }}
          >
            CallMind takes perfect meeting notes and gives you real-time answers,
            all while completely undetectable. Available for macOS and Windows.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
            <Button size="lg" className="h-12 px-8 text-base gap-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300" asChild>
              <a href="#">
                <Monitor className="w-5 h-5" />
                Download for Windows
              </a>
            </Button>
          </div>

          <div className="border-t border-border pt-16">
            <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-12 text-left md:ml-12 lg:ml-0">
              System requirements for optimal performance
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12 text-left max-w-3xl mx-auto">
              {/* macOS */}
              <div className="space-y-4">
                 <div className="flex items-center gap-2 mb-4">
                    <Laptop className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">macOS</h3>
                 </div>
                 <ul className="space-y-2 text-sm text-muted-foreground/80">
                    <li>• macOS 10.15 (Catalina) or later</li>
                    <li>• Apple Silicon or Intel processor</li>
                    <li>• 500 MB free disk space</li>
                    <li>• 8 GB RAM recommended</li>
                 </ul>
              </div>

               {/* Windows */}
              <div className="space-y-4">
                 <div className="flex items-center gap-2 mb-4">
                    <Monitor className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">Windows</h3>
                 </div>
                 <ul className="space-y-2 text-sm text-muted-foreground/80">
                    <li>• Windows 11</li>
                    <li>• x64 (64-bit) processor</li>
                    <li>• 500 MB free disk space</li>
                    <li>• 8 GB RAM recommended</li>
                 </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  )
}
