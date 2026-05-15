"use client";

import { useState } from "react";
import { useRouter } from "@/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Link2, Image, Type, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";

export function HeroInput() {
  const t = useTranslations("hero");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("url");
  const [value, setValue] = useState("");

  const tabs = [
    { value: "url", label: t("urlTab"), icon: Link2, placeholder: t("urlPlaceholder") },
    { value: "text", label: t("textTab"), icon: Type, placeholder: t("textPlaceholder") },
    { value: "image", label: t("imageTab"), icon: Image, placeholder: t("imagePlaceholder") },
  ] as const;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    const params = new URLSearchParams({
      type: activeTab,
      q: value.trim(),
    });
    router.push(`/analyze?${params.toString()}` as Parameters<typeof router.push>[0]);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4 bg-white/50 dark:bg-white/5 backdrop-blur-sm border">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-violet-600 data-[state=active]:text-white"
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <div className="pointer-events-none absolute left-4 text-muted-foreground">
            <Sparkles className="h-5 w-5 text-indigo-500" />
          </div>
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={tabs.find((t) => t.value === activeTab)?.placeholder}
            className="h-14 rounded-2xl border-2 border-indigo-100 bg-white pl-12 pr-36 text-base shadow-xl shadow-indigo-500/5 transition-all placeholder:text-muted-foreground/60 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5"
          />
          <Button
            type="submit"
            disabled={!value.trim()}
            className="absolute right-2 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-600 hover:to-violet-700 hover:shadow-indigo-500/40 disabled:opacity-50"
          >
            {t("analyzeButton")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        {t("freeNote")}
      </p>
    </motion.div>
  );
}
