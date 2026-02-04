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
  enterprisePlan?: PricingPlan;
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
        { text: "2 calls/month" },
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
      description: "Perfect for small businesses",
      monthlyPrice: "$69",
      yearlyPrice: "$690",
      features: [
        { text: "50 calls/month" },
        { text: "3 AI agents" },
        { text: "Uzbek, English & Russian" },
        { text: "Multiple voice options" },
        { text: "Call transcripts" },
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
      monthlyPrice: "$172",
      yearlyPrice: "$1,720",
      features: [
        { text: "125 calls/month" },
        { text: "10 AI agents" },
        { text: "All languages" },
        { text: "Premium voices & emotions" },
        { text: "Advanced sentiment analysis" },
        { text: "CRM integrations" },
        { text: "Knowledge base" },
        { text: "Priority support" },
      ],
      button: {
        text: "Purchase",
        url: "https://shadcnblocks.com",
      },
    },
    {
      id: "business",
      name: "Business",
      description: "For established teams",
      monthlyPrice: "$345",
      yearlyPrice: "$3,450",
      features: [
        { text: "250 calls/month" },
        { text: "25 AI agents" },
        { text: "All languages" },
        { text: "Premium voices & emotions" },
        { text: "Advanced sentiment analysis" },
        { text: "CRM integrations" },
        { text: "Knowledge base" },
        { text: "Priority support" },
        { text: "Custom integrations" },
      ],
      button: {
        text: "Purchase",
        url: "https://shadcnblocks.com",
      },
    },
  ],
  enterprisePlan = {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations",
    monthlyPrice: "Negotiable",
    yearlyPrice: "Negotiable",
    features: [
      { text: "Custom call volume" },
      { text: "Unlimited AI agents" },
      { text: "All languages + custom models" },
      { text: "Custom voice cloning" },
      { text: "Advanced analytics dashboard" },
      { text: "Full API access" },
      { text: "Dedicated account manager" },
      { text: "SSO & advanced security" },
      { text: "SLA guarantee" },
      { text: "On-premise option" },
    ],
    button: {
      text: "Contact Sales",
      url: "mailto:sales@callmind.uz",
    },
  },
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

        {/* Enterprise Plan - Separate Section */}
        {enterprisePlan && (
          <div className="mt-20 max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-muted to-muted/50 border-2">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between md:gap-8">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl lg:text-3xl">
                      {enterprisePlan.name}
                    </CardTitle>
                    <p className="text-muted-foreground">
                      {enterprisePlan.description}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground mb-1">Pricing</p>
                    <p className="text-2xl font-semibold">{enterprisePlan.monthlyPrice}</p>
                    <p className="text-xs text-muted-foreground">Contact us for custom quote</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Separator className="mb-6" />
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <p className="mb-4 font-semibold">Key Features:</p>
                    <ul className="space-y-3">
                      {enterprisePlan.features.slice(0, 5).map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <CircleCheck className="size-4 text-primary" />
                          <span>{feature.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-4 font-semibold">Enterprise Benefits:</p>
                    <ul className="space-y-3">
                      {enterprisePlan.features.slice(5).map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <CircleCheck className="size-4 text-primary" />
                          <span>{feature.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="mt-auto">
                <Button asChild size="lg" className="w-full">
                  <a href={enterprisePlan.button.url}>
                    {enterprisePlan.button.text}
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
};

export { Pricing2 };
