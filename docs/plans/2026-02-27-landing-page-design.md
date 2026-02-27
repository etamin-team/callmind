# Callmind Landing Page Design

**Date:** 2026-02-27
**Status:** Approved
**Approach:** Single Long-Scroll Page (Approach 1)

## Overview

A Linear.app-inspired landing page for Callmind, a call center SaaS application. The page is designed for lead generation, targeting non-call center businesses who need affordable, easy-to-use call management.

## Target Audience

Non-call center businesses (e-commerce, local services, SMBs) who need call capabilities but find traditional solutions too complex or expensive.

## Primary Goal

Convert visitors to sign up for a free trial or demo.

## Page Structure

### 1. Navbar (Fixed)

**Location:** Fixed at top, glassmorphism effect
**Colors:** `bg-background/80 backdrop-blur-md`, `text-foreground`, `text-muted-foreground`, `bg-primary` + `text-primary-foreground` for CTA
**Layout:** Flexbox, `max-w-7xl mx-auto px-6 py-4`
**Content:**

- Logo: "Callmind" with gradient text using `primary`
- Navigation: Features, Pricing, About (desktop only)
- CTA: "Sign Up" button

**Mobile:** Hide nav links, show only logo + CTA

### 2. Hero Section

**Location:** Full viewport height (`min-h-screen`)
**Colors:** Gradient background using `primary`, mesh gradient overlay
**Layout:** Two-column desktop, stacked mobile
**Content:**

- Headline: Large (`text-5xl md:text-7xl font-bold`), `text-foreground`
- Subheadline: `text-xl md:text-2xl text-muted-foreground`
- CTAs: "Get Started Free" (`bg-primary text-primary-foreground`), "View Demo" (`bg-secondary text-secondary-foreground`)
- Visual: Abstract call center UI with glassmorphism cards

### 3. Social Proof

**Location:** Compact bar below hero
**Colors:** `bg-muted/30`, `border-t border-border`, `text-muted-foreground`
**Content:** "Trusted by teams at [Company1] [Company2] [Company3]"

### 4. Features Section

**Location:** 6-feature grid
**Colors:** Cards with `bg-card border border-border`, `text-foreground` headings, `text-muted-foreground` descriptions, `primary` icon accents
**Layout:** 3 columns desktop, 2 tablet, 1 mobile
**Features:**

1. AI-Powered Assistance
2. Easy to Get Started
3. Affordable Pricing
4. Smart Call Routing
5. Analytics & Insights
6. Integrations

Each card: Icon + title + 2-line description

### 5. Bottom CTA Section

**Location:** Full-width section before footer
**Colors:** `bg-primary`, centered content
**Content:**

- Large headline: `text-foreground`
- Brief subtext
- CTA: "Get Started Free" (`bg-background text-foreground`)

### 6. Footer

**Location:** Bottom of page
**Colors:** `bg-background text-muted-foreground`, `border-t border-border`
**Layout:** 4-column: Brand, Product, Company, Legal

## Design Principles

1. **Linear-inspired minimalism** - Clean, modern, dark mode by default
2. **High contrast on CTAs** - Use `primary` and `background` for maximum visibility
3. **Glassmorphism** - Subtle blur effects on cards and navbar
4. **All CSS variables** - No hardcoded colors, use globals.css values
5. **Mobile-first responsive** - Stack on mobile, expand on tablet/desktop
6. **Conversion-focused** - Every section drives toward sign-up

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS v4
- **Components:** Shadcn UI
- **Icons:** @hugeicons/react

## File Structure

```
apps/web/
├── app/
│   ├── marketing/
│   │   └── page.tsx          # Main landing page
│   ├── globals.css           # All color variables
│   └── layout.tsx            # Root layout
└── components/
    └── marketing/
        ├── Navbar.tsx        # Navigation component
        ├── Hero.tsx          # Hero section
        ├── SocialProof.tsx   # Trust signals
        ├── Features.tsx      # Features grid
        ├── BottomCTA.tsx     # Final CTA section
        └── Footer.tsx        # Footer component
```

## SEO Requirements

- Meta title: "Callmind - Affordable Call Center Software for Growing Teams"
- Meta description: "Get started in minutes with AI-powered call management. Smart routing, analytics, and integrations at prices that fit your budget."
- Open Graph tags for social sharing

## Performance Requirements

- Lighthouse score 90+
- Core Web Vitals in green
- Fast initial load (< 2s)
- Optimize images and fonts

## Success Criteria

1. Conversion to sign-up (primary)
2. Clear value communication
3. Mobile responsiveness
4. Performance & aesthetics
5. Search discoverability (SEO)
6. Production-ready implementation

## Key Value Propositions

1. **AI-Powered Assistance** - Help agents handle calls more efficiently
2. **Easy to Get Started** - Setup in minutes, no technical expertise
3. **Affordable Pricing** - Pay as you grow, transparent costs
4. **Smart Call Routing** - Auto-route to the right person/team
5. **Analytics & Insights** - Track performance, optimize operations
6. **Integrations** - Connect with your existing tools

## Next Steps

Implement following the writing-plans skill output.
