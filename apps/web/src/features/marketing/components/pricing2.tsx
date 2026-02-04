"use client";

import { CircleCheck } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

interface PricingFeature {
  text: string;
}

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: string;
  yearlyPrice: string;
  features: PricingFeature[];
  button: {
    text: string;
    url: string;
  };
}

interface Pricing2Props {
  heading?: string;
  description?: string;
  plans?: PricingPlan[];
  className?: string;
}

const Pricing2 = ({
  heading = "Simple, Transparent Pricing",
  description = "Start with AI call center agents today. Scale as your business grows across languages and channels.",
  plans = [
    {
      id: "free",
      name: "Free",
      description: "Try out AI agents",
      monthlyPrice: "$0",
      yearlyPrice: "$0",
      features: [
        { text: "10 calls/month" },
        { text: "1 AI agent" },
        { text: "Uzbek language support" },
        { text: "Basic voice options" },
        { text: "Call history" },
      ],
      button: {
        text: "Get Started",
        url: "/sign-up",
      },
    },
    {
      id: "starter",
      name: "Starter",
      description: "Perfect for small teams",
      monthlyPrice: "$29",
      yearlyPrice: "$290",
      features: [
        { text: "100 calls/month" },
        { text: "3 AI agents" },
        { text: "Uzbek, English & Russian languages" },
        { text: "Multiple voice options" },
        { text: "Call transcripts & recording" },
        { text: "Basic analytics" },
        { text: "Email support" },
      ],
      button: {
        text: "Purchase",
        url: "https://shadcnblocks.com",
      },
    },
    {
      id: "pro",
      name: "Professional",
      description: "For growing call centers",
      monthlyPrice: "$79",
      yearlyPrice: "$790",
      features: [
        { text: "500 calls/month" },
        { text: "10 AI agents" },
        { text: "All language support" },
        { text: "Premium voices & emotions" },
        { text: "Advanced sentiment analysis" },
        { text: "CRM integration (HubSpot, Salesforce)" },
        { text: "Knowledge base & training" },
        { text: "Priority support" },
      ],
      button: {
        text: "Purchase",
        url: "https://shadcnblocks.com",
      },
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "For enterprise teams",
      monthlyPrice: "$199",
      yearlyPrice: "$1,990",
      features: [
        { text: "2,000 calls/month" },
        { text: "Unlimited AI agents" },
        { text: "All languages + custom models" },
        { text: "Custom voice cloning" },
        { text: "Advanced conversation analytics" },
        { text: "Custom integrations & API access" },
        { text: "Dedicated success manager" },
        { text: "SSO & advanced security" },
        { text: "On-premise deployment option" },
      ],
      button: {
        text: "Contact Sales",
        url: "https://shadcnblocks.com",
      },
    },
  ],
  className,
}: Pricing2Props) => {
  const [isYearly, setIsYearly] = useState(false);
  return (
    <section className={cn("py-32", className)}>
      <div className="container mx-auto">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
          <h2 className="text-4xl font-semibold text-pretty lg:text-6xl">
            {heading}
          </h2>
          <p className="text-muted-foreground lg:text-xl">{description}</p>
          <div className="flex items-center gap-3 text-lg">
            Monthly
            <Switch
              checked={isYearly}
              onCheckedChange={() => setIsYearly(!isYearly)}
            />
            Yearly
          </div>
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-center md:items-start lg:items-stretch lg:gap-8">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className="flex w-80 flex-col justify-between text-left"
              >
                <CardHeader>
                  <CardTitle>
                    <p>{plan.name}</p>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                  <div className="flex items-end">
                    <span className="text-4xl font-semibold">
                      {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-2xl font-semibold text-muted-foreground">
                      {isYearly ? "/yr" : "/mo"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <Separator className="mb-6" />
                  {plan.id === "pro" && (
                    <p className="mb-3 font-semibold">
                      Everything in Plus, and:
                    </p>
                  )}
                  {plan.id === "enterprise" && (
                    <p className="mb-3 font-semibold">
                      Everything in Pro, and:
                    </p>
                  )}
                  <ul className="space-y-4">
                    {plan.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <CircleCheck className="size-4" />
                        <span>{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="mt-auto">
                  <Button asChild className="w-full">
                    <a href={plan.button.url} target="_blank">
                      {plan.button.text}
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export { Pricing2 };
