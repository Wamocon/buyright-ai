"use client";

import { motion } from "framer-motion";
import {
  Shield,
  Zap,
  TrendingUp,
  Eye,
  BarChart3,
  AlertTriangle,
  Search,
  Star,
  ArrowRight,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useState } from "react";

// ============================================================================
// Animation variants
// ============================================================================
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ============================================================================
// Problem Section
// ============================================================================
export function ProblemSection() {
  const problems = [
    { icon: XCircle, text: "72% of online reviews are fake or manipulated", color: "text-red-500" },
    { icon: AlertTriangle, text: "Average consumer wastes $1,200/year on bad purchases", color: "text-amber-500" },
    { icon: Eye, text: "Sponsored results hide better, cheaper alternatives", color: "text-orange-500" },
  ];

  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="text-center"
        >
          <motion.div variants={fadeUp} custom={0}>
            <Badge variant="outline" className="mb-4 border-red-200 text-red-600 dark:border-red-800 dark:text-red-400">
              The Problem
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="text-3xl font-bold tracking-tight md:text-4xl"
          >
            Online shopping is a{" "}
            <span className="text-red-500">minefield</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={2}
            className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground"
          >
            Fake reviews, hidden costs, and manipulated rankings make it nearly
            impossible to know if you are getting a good deal.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
          className="mt-12 grid gap-6 md:grid-cols-3"
        >
          {problems.map((problem, i) => (
            <motion.div key={i} variants={fadeUp} custom={i}>
              <Card className="border-none bg-red-50/50 dark:bg-red-950/10">
                <CardContent className="flex items-start gap-4 p-6">
                  <problem.icon className={`h-6 w-6 shrink-0 mt-0.5 ${problem.color}`} />
                  <p className="text-sm font-medium">{problem.text}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// Benefits Section
// ============================================================================
export function BenefitsSection() {
  const benefits = [
    {
      icon: Shield,
      title: "Scam Protection",
      description: "AI detects fake reviews, suspicious pricing, and known scam patterns.",
    },
    {
      icon: Zap,
      title: "Instant Analysis",
      description: "Get a comprehensive product analysis in under 10 seconds.",
    },
    {
      icon: TrendingUp,
      title: "Smart Alternatives",
      description: "Discover better products at the same or lower price point.",
    },
    {
      icon: BarChart3,
      title: "Clear Score",
      description: "One score from 0-100. BUY, DON'T BUY, or ONLY IF. No ambiguity.",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="text-center"
        >
          <motion.div variants={fadeUp} custom={0}>
            <Badge variant="outline" className="mb-4 border-emerald-200 text-emerald-600 dark:border-emerald-800 dark:text-emerald-400">
              Why BuyRight AI
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="text-3xl font-bold tracking-tight md:text-4xl"
          >
            Your AI-powered{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
              purchase advisor
            </span>
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {benefits.map((benefit, i) => (
            <motion.div key={i} variants={fadeUp} custom={i}>
              <Card className="group h-full border-none bg-card shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 transition-colors group-hover:from-indigo-500/20 group-hover:to-violet-500/20">
                    <benefit.icon className="h-6 w-6 text-indigo-500" />
                  </div>
                  <h3 className="text-lg font-semibold">{benefit.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// How It Works Section
// ============================================================================
export function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      icon: Search,
      title: "Paste or Upload",
      description: "Enter a product URL, name, or upload a photo of the product.",
    },
    {
      num: "02",
      icon: Zap,
      title: "AI Analyzes",
      description: "Our AI examines price, quality, reviews, risks, and market position.",
    },
    {
      num: "03",
      icon: Star,
      title: "Get Your Score",
      description: "Receive a clear 0-100 score with BUY / DON'T BUY recommendation.",
    },
  ];

  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="text-center"
        >
          <motion.div variants={fadeUp} custom={0}>
            <Badge variant="outline" className="mb-4">How It Works</Badge>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="text-3xl font-bold tracking-tight md:text-4xl"
          >
            Three steps to a{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
              smarter purchase
            </span>
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
          className="mt-16 grid gap-8 md:grid-cols-3"
        >
          {steps.map((step, i) => (
            <motion.div key={i} variants={fadeUp} custom={i} className="relative text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
                <step.icon className="h-7 w-7 text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">
                Step {step.num}
              </span>
              <h3 className="mt-2 text-xl font-bold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {step.description}
              </p>
              {i < steps.length - 1 && (
                <ArrowRight className="absolute -right-4 top-8 hidden h-5 w-5 text-muted-foreground/30 md:block" />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// Demo Analysis Section
// ============================================================================
export function DemoSection() {
  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="text-center"
        >
          <motion.div variants={fadeUp} custom={0}>
            <Badge variant="outline" className="mb-4">Live Demo</Badge>
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl font-bold tracking-tight md:text-4xl">
            See it in action
          </motion.h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mx-auto mt-12 max-w-3xl"
        >
          <Card className="overflow-hidden border-2 border-indigo-100 dark:border-indigo-900/30">
            <CardContent className="p-0">
              {/* Mock result header */}
              <div className="border-b bg-gradient-to-r from-indigo-500/5 to-violet-500/5 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Analysis Result</p>
                    <h3 className="text-xl font-bold">Sony WH-1000XM5</h3>
                    <p className="text-sm text-muted-foreground">Premium Noise-Cancelling Headphones</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-lg shadow-emerald-500/25">
                      <span className="text-2xl font-bold text-white">87</span>
                    </div>
                    <Badge className="mt-2 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                      BUY
                    </Badge>
                  </div>
                </div>
              </div>
              {/* Mock details */}
              <div className="grid gap-4 p-6 md:grid-cols-2">
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" /> Pros
                  </h4>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>Industry-leading noise cancellation</li>
                    <li>30h battery life</li>
                    <li>Multipoint Bluetooth connection</li>
                  </ul>
                </div>
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-red-500">
                    <XCircle className="h-4 w-4" /> Cons
                  </h4>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>Premium price point ($350+)</li>
                    <li>No IP rating for water resistance</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// Features Section
// ============================================================================
export function FeaturesSection() {
  const features = [
    { icon: Shield, title: "Scam Detection", desc: "AI identifies fake reviews and suspicious patterns" },
    { icon: BarChart3, title: "Price Analysis", desc: "Know if you are paying too much" },
    { icon: TrendingUp, title: "Better Alternatives", desc: "Discover products you did not know existed" },
    { icon: Zap, title: "10-Second Analysis", desc: "Results faster than reading one review" },
    { icon: Eye, title: "Image Analysis", desc: "Upload a photo, get instant insights" },
    { icon: Star, title: "Score 0-100", desc: "One number that tells the whole story" },
  ];

  return (
    <section id="features" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="text-center"
        >
          <motion.div variants={fadeUp} custom={0}>
            <Badge variant="outline" className="mb-4">Features</Badge>
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl font-bold tracking-tight md:text-4xl">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
              shop smarter
            </span>
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
          className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, i) => (
            <motion.div key={i} variants={fadeUp} custom={i}>
              <Card className="group h-full border-none shadow-sm transition-all hover:shadow-md">
                <CardContent className="flex items-start gap-4 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10">
                    <feature.icon className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// Pricing Section
// ============================================================================
export function PricingSection() {
  const plans = [
    {
      name: "Free",
      price: "0",
      description: "Try BuyRight AI",
      features: [
        "3 product checks per day",
        "Basic analysis",
        "2 alternatives",
        "No signup required",
      ],
      cta: "Start Free",
      href: "/analyze",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "9.99",
      description: "For smart shoppers",
      features: [
        "Unlimited product checks",
        "Deep analysis",
        "Up to 5 alternatives",
        "PDF export",
        "Full history",
        "Priority processing",
      ],
      cta: "Start Pro",
      href: "/signup",
      highlighted: true,
    },
  ];

  return (
    <section id="pricing" className="py-20 md:py-28 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="text-center"
        >
          <motion.div variants={fadeUp} custom={0}>
            <Badge variant="outline" className="mb-4">Pricing</Badge>
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl font-bold tracking-tight md:text-4xl">
            Simple, transparent pricing
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Start free. Upgrade when you need more.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
          className="mx-auto mt-12 grid max-w-3xl gap-8 md:grid-cols-2"
        >
          {plans.map((plan, i) => (
            <motion.div key={i} variants={fadeUp} custom={i}>
              <Card
                className={`relative h-full ${
                  plan.highlighted
                    ? "border-2 border-indigo-500 shadow-xl shadow-indigo-500/10"
                    : "border shadow-sm"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-4">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    {plan.price !== "0" && (
                      <span className="text-sm text-muted-foreground">/month</span>
                    )}
                  </div>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature, fi) => (
                      <li key={fi} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`mt-8 w-full ${
                      plan.highlighted
                        ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-violet-700"
                        : ""
                    }`}
                    variant={plan.highlighted ? "default" : "outline"}
                    render={<Link href={plan.href} />}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// Testimonials Section
// ============================================================================
export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah K.",
      role: "Online Shopper",
      text: "BuyRight AI saved me from buying a laptop with known overheating issues. The alternatives it suggested were actually better and cheaper!",
      rating: 5,
    },
    {
      name: "Marco T.",
      role: "Tech Enthusiast",
      text: "I use it before every purchase now. The scam detection alone is worth it. Caught a fake 'deal' that had manipulated reviews.",
      rating: 5,
    },
    {
      name: "Lisa M.",
      role: "Smart Shopper",
      text: "Simple, fast, and accurate. I love the clear BUY/DON'T BUY recommendation. No more analysis paralysis.",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="text-center"
        >
          <motion.div variants={fadeUp} custom={0}>
            <Badge variant="outline" className="mb-4">
              <MessageSquare className="mr-1 h-3 w-3" />
              Testimonials
            </Badge>
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl font-bold tracking-tight md:text-4xl">
            Loved by smart shoppers
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
          className="mt-12 grid gap-6 md:grid-cols-3"
        >
          {testimonials.map((t, i) => (
            <motion.div key={i} variants={fadeUp} custom={i}>
              <Card className="h-full border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="flex gap-1">
                    {Array.from({ length: t.rating }).map((_, si) => (
                      <Star key={si} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="mt-4 border-t pt-4">
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// FAQ Section
// ============================================================================
export function FAQSection() {
  const faqs = [
    {
      q: "How does BuyRight AI work?",
      a: "Our AI analyzes products using multiple data points: price history, review patterns, quality indicators, and market comparison. It then generates a comprehensive score and recommendation.",
    },
    {
      q: "Is it really free?",
      a: "Yes! You get 3 free product analyses per day without any signup. The Pro plan offers unlimited checks and additional features.",
    },
    {
      q: "What products can I analyze?",
      a: "Almost anything sold online: electronics, appliances, fashion, tools, home goods, and more. Just paste a URL, type a product name, or upload an image.",
    },
    {
      q: "How accurate is the AI?",
      a: "Our AI is powered by advanced language models and uses real market data. While no system is perfect, our analysis provides a reliable starting point for purchase decisions.",
    },
    {
      q: "Is my data safe?",
      a: "Absolutely. We are GDPR compliant, do not sell your data, and uploaded images are automatically deleted after analysis. See our privacy policy for details.",
    },
  ];

  return (
    <section id="faq" className="py-20 md:py-28 bg-muted/30">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="text-center"
        >
          <motion.div variants={fadeUp} custom={0}>
            <Badge variant="outline" className="mb-4">FAQ</Badge>
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl font-bold tracking-tight md:text-4xl">
            Frequently asked questions
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
          className="mt-12 space-y-4"
        >
          {faqs.map((faq, i) => (
            <FAQItem key={i} question={faq.q} answer={faq.a} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div variants={fadeUp} custom={index}>
      <Card className="border-none shadow-sm">
        <button
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between p-5 text-left"
        >
          <span className="font-semibold">{question}</span>
          <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <div className="px-5 pb-5 pt-0">
            <p className="text-sm text-muted-foreground leading-relaxed">{answer}</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

// ============================================================================
// CTA Section
// ============================================================================
export function CTASection() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 p-8 text-center text-white shadow-2xl shadow-indigo-500/25 md:p-16"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
          <div className="relative">
            <h2 className="text-3xl font-bold md:text-4xl">
              Stop guessing. Start buying smart.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-indigo-100">
              Join thousands of smart shoppers who check before they buy.
              Free, no signup required.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-xl"
                render={<Link href="/analyze" />}
              >
                Start Free Analysis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                render={<Link href="/#pricing" />}
              >
                View Pricing
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
