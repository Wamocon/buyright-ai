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
  ShieldAlert,
  Wallet,
  GitCompare,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";

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
// Tools Showcase Section (4 modules)
// ============================================================================
export function ToolsShowcaseSection() {
  const t = useTranslations("landing.tools");

  const toolCards = [
    {
      href: "/analyze",
      icon: Search,
      color: "from-indigo-500 to-violet-600",
      shadow: "shadow-indigo-500/25",
      bg: "from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20",
      border: "border-indigo-100 dark:border-indigo-900/50",
      badge: "text-indigo-600 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:border-indigo-800",
      label: t("analyzeLabel"),
      title: t("analyzeTitle"),
      desc: t("analyzeDesc"),
      features: [t("analyzeF1"), t("analyzeF2"), t("analyzeF3")],
    },
    {
      href: "/compare",
      icon: GitCompare,
      color: "from-blue-500 to-cyan-600",
      shadow: "shadow-blue-500/25",
      bg: "from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20",
      border: "border-blue-100 dark:border-blue-900/50",
      badge: "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:border-blue-800",
      label: t("compareLabel"),
      title: t("compareTitle"),
      desc: t("compareDesc"),
      features: [t("compareF1"), t("compareF2"), t("compareF3")],
    },
    {
      href: "/fake-detector",
      icon: ShieldAlert,
      color: "from-amber-500 to-orange-600",
      shadow: "shadow-amber-500/25",
      bg: "from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20",
      border: "border-amber-100 dark:border-amber-900/50",
      badge: "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:border-amber-800",
      label: t("fakeLabel"),
      title: t("fakeTitle"),
      desc: t("fakeDesc"),
      features: [t("fakeF1"), t("fakeF2"), t("fakeF3")],
      isNew: true,
    },
    {
      href: "/budget-optimizer",
      icon: Wallet,
      color: "from-violet-500 to-purple-600",
      shadow: "shadow-violet-500/25",
      bg: "from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20",
      border: "border-violet-100 dark:border-violet-900/50",
      badge: "text-violet-600 bg-violet-50 border-violet-200 dark:text-violet-400 dark:border-violet-800",
      label: t("budgetLabel"),
      title: t("budgetTitle"),
      desc: t("budgetDesc"),
      features: [t("budgetF1"), t("budgetF2"), t("budgetF3")],
      isNew: true,
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="text-center"
        >
          <motion.div variants={fadeUp} custom={0}>
            <Badge variant="outline" className="mb-4 gap-1.5 border-indigo-200 text-indigo-600 dark:border-indigo-800 dark:text-indigo-400">
              <Sparkles className="h-3 w-3" />
              {t("badge")}
            </Badge>
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            {t("title")}{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 bg-clip-text text-transparent">
              {t("titleHighlight")}
            </span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {t("subtitle")}
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {toolCards.map((tool, i) => (
            <motion.div key={i} variants={fadeUp} custom={i}>
              <Link href={tool.href} className="group block h-full">
                <div className={`relative h-full rounded-2xl border bg-gradient-to-br p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 ${tool.bg} ${tool.border}`}>
                  {tool.isNew && (
                    <span className="absolute -top-2.5 right-4 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
                      NEW
                    </span>
                  )}

                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${tool.color} shadow-lg ${tool.shadow}`}>
                    <tool.icon className="h-5 w-5 text-white" />
                  </div>

                  <span className={`mb-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${tool.badge}`}>
                    {tool.label}
                  </span>

                  <h3 className="mt-2 text-base font-bold leading-snug">{tool.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{tool.desc}</p>

                  <ul className="mt-4 space-y-1.5">
                    {tool.features.map((feat, j) => (
                      <li key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 flex items-center gap-1 text-sm font-semibold text-foreground group-hover:gap-2 transition-all">
                    {t("tryNow")}
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// Problem Section
// ============================================================================
export function ProblemSection() {
  const t = useTranslations("landing.problem");

  const problems = [
    { icon: XCircle, text: t("stat1"), color: "text-red-500" },
    { icon: AlertTriangle, text: t("stat2"), color: "text-amber-500" },
    { icon: Eye, text: t("stat3"), color: "text-orange-500" },
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
              {t("badge")}
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="text-3xl font-bold tracking-tight md:text-4xl"
          >
            {t("title")}{" "}
            <span className="text-red-500">{t("titleHighlight")}</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={2}
            className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground"
          >
            {t("subtitle")}
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
  const t = useTranslations("landing.benefits");

  const benefits = [
    { icon: Shield, title: t("scamTitle"), description: t("scamDesc") },
    { icon: Zap, title: t("instantTitle"), description: t("instantDesc") },
    { icon: TrendingUp, title: t("alternativesTitle"), description: t("alternativesDesc") },
    { icon: BarChart3, title: t("scoreTitle"), description: t("scoreDesc") },
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
              {t("badge")}
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="text-3xl font-bold tracking-tight md:text-4xl"
          >
            {t("title")}{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
              {t("titleHighlight")}
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
                  <p className="mt-2 text-sm text-muted-foreground">{benefit.description}</p>
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
  const t = useTranslations("landing.howItWorks");

  const steps = [
    { num: "01", icon: Search, title: t("step1Title"), description: t("step1Desc") },
    { num: "02", icon: Zap, title: t("step2Title"), description: t("step2Desc") },
    { num: "03", icon: Star, title: t("step3Title"), description: t("step3Desc") },
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
            <Badge variant="outline" className="mb-4">{t("badge")}</Badge>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="text-3xl font-bold tracking-tight md:text-4xl"
          >
            {t("title")}{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
              {t("titleHighlight")}
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
                {t("step")} {step.num}
              </span>
              <h3 className="mt-2 text-xl font-bold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
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
// Demo Section
// ============================================================================
export function DemoSection() {
  const t = useTranslations("landing.demo");

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
            <Badge variant="outline" className="mb-4">{t("badge")}</Badge>
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl font-bold tracking-tight md:text-4xl">
            {t("title")}
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
              <div className="border-b bg-gradient-to-r from-indigo-500/5 to-violet-500/5 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("resultLabel")}</p>
                    <h3 className="text-xl font-bold">Sony WH-1000XM5</h3>
                    <p className="text-sm text-muted-foreground">{t("productDesc")}</p>
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
              <div className="grid gap-4 p-6 md:grid-cols-2">
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" /> {t("pros")}
                  </h4>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>{t("pro1")}</li>
                    <li>{t("pro2")}</li>
                    <li>{t("pro3")}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-red-500">
                    <XCircle className="h-4 w-4" /> {t("cons")}
                  </h4>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>{t("con1")}</li>
                    <li>{t("con2")}</li>
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
  const t = useTranslations("landing.features");

  const features = [
    { icon: Shield, title: t("scamTitle"), desc: t("scamDesc") },
    { icon: BarChart3, title: t("priceTitle"), desc: t("priceDesc") },
    { icon: TrendingUp, title: t("altTitle"), desc: t("altDesc") },
    { icon: Zap, title: t("fastTitle"), desc: t("fastDesc") },
    { icon: Eye, title: t("imageTitle"), desc: t("imageDesc") },
    { icon: Star, title: t("scoreTitle"), desc: t("scoreDesc") },
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
            <Badge variant="outline" className="mb-4">{t("badge")}</Badge>
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl font-bold tracking-tight md:text-4xl">
            {t("title")}{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
              {t("titleHighlight")}
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
  const t = useTranslations("landing.pricing");

  const plans = [
    {
      name: t("freeName"),
      price: "0",
      description: t("freeDesc"),
      features: [t("freef1"), t("freef2"), t("freef3"), t("freef4")],
      cta: t("freeCta"),
      href: "/analyze",
      highlighted: false,
    },
    {
      name: t("proName"),
      price: "9.99",
      description: t("proDesc"),
      features: [t("prof1"), t("prof2"), t("prof3"), t("prof4"), t("prof5"), t("prof6")],
      cta: t("proCta"),
      href: "/login",
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
            <Badge variant="outline" className="mb-4">{t("badge")}</Badge>
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl font-bold tracking-tight md:text-4xl">
            {t("title")}
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            {t("subtitle")}
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
                      {t("mostPopular")}
                    </Badge>
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    {plan.price !== "0" && (
                      <span className="text-sm text-muted-foreground">{t("perMonth")}</span>
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
                    nativeButton={false} render={<Link href={plan.href as Parameters<typeof Link>[0]["href"]} />}
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
  const t = useTranslations("landing.testimonials");

  const testimonials = [
    { name: t("t1Name"), role: t("t1Role"), text: t("t1Text"), rating: 5 },
    { name: t("t2Name"), role: t("t2Role"), text: t("t2Text"), rating: 5 },
    { name: t("t3Name"), role: t("t3Role"), text: t("t3Text"), rating: 5 },
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
              {t("badge")}
            </Badge>
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl font-bold tracking-tight md:text-4xl">
            {t("title")}
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
  const t = useTranslations("landing.faq");

  const faqs = [
    { q: t("q1"), a: t("a1") },
    { q: t("q2"), a: t("a2") },
    { q: t("q3"), a: t("a3") },
    { q: t("q4"), a: t("a4") },
    { q: t("q5"), a: t("a5") },
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
            <Badge variant="outline" className="mb-4">{t("badge")}</Badge>
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl font-bold tracking-tight md:text-4xl">
            {t("title")}
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
  const t = useTranslations("landing.cta");

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
            <h2 className="text-3xl font-bold md:text-4xl">{t("title")}</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-indigo-100">{t("subtitle")}</p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-xl"
                nativeButton={false} render={<Link href="/analyze" />}
              >
                {t("startFree")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                nativeButton={false} render={<Link href="/#pricing" />}
              >
                {t("viewPricing")}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ...existing code...
