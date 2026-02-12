"use client";

import { Check } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const plans = [
  {
    id: "free",
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    description: "Try it out",
    features: ["2 calls/month", "1 AI agent", "Basic analytics"],
    cta: "Get Started",
    href: "/sign-up",
  },
  {
    id: "starter",
    name: "Starter",
    price: { monthly: 69, yearly: 690 },
    description: "For small teams",
    features: [
      "200 calls/month",
      "3 AI agents",
      "All languages",
      "Call transcripts",
      "Email support",
    ],
    cta: "Get Started",
    href: "/sign-up",
    popular: true,
  },
  {
    id: "pro",
    name: "Professional",
    price: { monthly: 172, yearly: 1720 },
    description: "For growing businesses",
    features: [
      "1000 calls/month",
      "40 super realistic calls",
      "10 AI agents",
      "Premium voices",
      "CRM integrations",
    ],
    cta: "Get Started",
    href: "/sign-up",
  },
  {
    id: "business",
    name: "Business",
    price: { monthly: 345, yearly: 3450 },
    description: "For enterprises",
    features: [
      "2000 calls/month",
      "90 super realistic calls",
      "25 AI agents",
      "Custom integrations",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    href: "mailto:sales@callmind.uz",
  },
];

interface Pricing2Props {
  className?: string;
}

const Pricing2 = ({ className }: Pricing2Props) => {
  const [yearly, setYearly] = useState(false);

  return (
    <section className={cn("py-24", className)}>
      <div className="container max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold mb-3">Pricing</h2>
          <p className="text-muted-foreground">Simple pricing. No hidden fees.</p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className="text-sm">Monthly</span>
            <Switch checked={yearly} onCheckedChange={setYearly} />
            <span className="text-sm">Yearly</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              Save 17%
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "relative rounded-xl border p-6 flex flex-col",
                plan.popular && "border-primary shadow-lg"
              )}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                  Popular
                </span>
              )}
              <div className="mb-4">
                <h3 className="font-semibold text-lg">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">
                  ${yearly ? plan.price.yearly : plan.price.monthly}
                </span>
                <span className="text-muted-foreground">/{yearly ? "yr" : "mo"}</span>
              </div>
              <ul className="space-y-3 mb-6 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
                asChild
              >
                <a href={plan.href}>{plan.cta}</a>
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Need more? <a href="mailto:sales@callmind.uz" className="underline">Contact us</a> for enterprise pricing.
        </p>
      </div>
    </section>
  );
};

export { Pricing2 };
