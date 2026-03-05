"use client";

import { Check, X, Volume2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";



interface VoiceComparisonProps {
  className?: string;
}

import { useTranslation } from 'react-i18next';

export function VoiceComparison({ className }: VoiceComparisonProps) {
  const { t } = useTranslation();
  
  const comparison = [
    {
      feature: t('marketing.voice_comparison.features.Natural Intonation'),
      standard: false,
      realistic: true,
      description: t('marketing.voice_comparison.values.Human-like speech patterns'),
    },
    {
      feature: t('marketing.voice_comparison.features.Emotional Expression'),
      standard: false,
      realistic: true,
      description: t('marketing.voice_comparison.values.Conveys empathy and tone'),
    },
    {
      feature: t('marketing.voice_comparison.features.Breathing Pauses'),
      standard: false,
      realistic: true,
      description: t('marketing.voice_comparison.values.Natural breathing rhythm'),
    },
    {
      feature: t('marketing.voice_comparison.features.Background Noise'),
      standard: false,
      realistic: true,
      description: t('marketing.voice_comparison.values.Subtle environmental sounds'),
    },
    {
      feature: t('marketing.voice_comparison.features.Filler Words'),
      standard: false,
      realistic: true,
      description: t('marketing.voice_comparison.values.Um, uh, like natural speech'),
    },
    {
      feature: t('marketing.voice_comparison.features.Response Latency'),
      standard: "1-2 seconds",
      realistic: "0.3-0.5 seconds",
      description: t('marketing.voice_comparison.values.Time to first response'),
    },
    {
      feature: t('marketing.voice_comparison.features.Customer Trust'),
      standard: t('marketing.voice_comparison.values.Low'),
      realistic: t('marketing.voice_comparison.values.High'),
      description: t('marketing.voice_comparison.values.Perceived authenticity'),
    },
  ];

  return (
    <section className={cn("py-24 bg-muted/30", className)}>
      <div className="container max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold mb-3">{t('marketing.voice_comparison.title')}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('marketing.voice_comparison.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Standard Voice */}
          <div className="rounded-2xl border bg-background p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-lg bg-muted p-3">
                <Volume2 className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{t('marketing.voice_comparison.standard.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('marketing.voice_comparison.standard.subtitle')}</p>
              </div>
            </div>
            <div className="space-y-4">
              {comparison.map((item) => (
                <div key={item.feature} className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {typeof item.standard === "boolean" ? (
                      item.standard ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground/50" />
                      )
                    ) : (
                      <span className="text-sm font-medium text-muted-foreground">{item.standard}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{item.feature}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{t('marketing.voice_comparison.standard.good_for')}</span> {t('marketing.voice_comparison.standard.good_for_text')}
              </p>
            </div>
          </div>

          {/* Super Realistic Voice */}
          <div className="rounded-2xl border-2 border-primary bg-background p-8 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3 w-3" />
                {t('marketing.voice_comparison.realistic.badge')}
              </span>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-lg bg-primary/10 p-3">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{t('marketing.voice_comparison.realistic.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('marketing.voice_comparison.realistic.subtitle')}</p>
              </div>
            </div>
            <div className="space-y-4">
              {comparison.map((item) => (
                <div key={item.feature} className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {typeof item.realistic === "boolean" ? (
                      item.realistic ? (
                        <Check className="h-5 w-5 text-primary" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground/50" />
                      )
                    ) : (
                      <span className="text-sm font-medium text-primary">{item.realistic}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{item.feature}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{t('marketing.voice_comparison.realistic.best_for')}</span> {t('marketing.voice_comparison.realistic.best_for_text')}
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          {t('marketing.voice_comparison.footer')}{" "}
          <a href="#pricing" className="underline">{t('marketing.voice_comparison.pricing_link')}</a>
        </p>
      </div>
    </section>
  );
}
