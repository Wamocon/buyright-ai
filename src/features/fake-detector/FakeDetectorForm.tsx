"use client";

import { useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Type, Loader2, ShieldAlert, ShieldCheck, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { fakeDetectorAction } from "@/actions/fake-detector";
import type { FakeDetectorResult } from "@/types";
import { toast } from "sonner";

const steps = [
  { en: "Scanning product listing...", de: "Produktlisting wird gescannt..." },
  { en: "Analyzing review patterns...", de: "Bewertungsmuster werden analysiert..." },
  { en: "Checking price anomalies...", de: "Preisanomalien werden geprüft..." },
  { en: "Evaluating seller trust...", de: "Verkäufervertrauen wird bewertet..." },
];

interface FakeDetectorFormProps {
  onResult: (result: FakeDetectorResult) => void;
}

export function FakeDetectorForm({ onResult }: FakeDetectorFormProps) {
  const t = useTranslations("fakeDetector");
  const locale = useLocale();
  const [tab, setTab] = useState("url");
  const [urlValue, setUrlValue] = useState("");
  const [textValue, setTextValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = tab === "url" ? urlValue : textValue;
    if (!value.trim()) return;

    setStep(0);
    const interval = setInterval(() => setStep((p) => Math.min(p + 1, steps.length - 1)), 1400);

    const fd = new FormData();
    fd.set("type", tab);
    fd.set("value", value.trim());
    fd.set("locale", locale);

    startTransition(async () => {
      const res = await fakeDetectorAction(fd);
      clearInterval(interval);
      if (res.success && res.data) {
        onResult(res.data);
      } else if (res.rateLimitExceeded) {
        toast.error(t("limitReached"));
      } else {
        toast.error(res.error ?? t("failed"));
      }
    });
  }

  const currentStep = steps[step];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full mb-6">
          <TabsTrigger value="url" className="flex-1 gap-2">
            <Link2 className="h-4 w-4" />
            {t("urlTab")}
          </TabsTrigger>
          <TabsTrigger value="text" className="flex-1 gap-2">
            <Type className="h-4 w-4" />
            {t("textTab")}
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value="url">
            <Input
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              placeholder={t("urlPlaceholder")}
              className="h-12 text-base"
              disabled={isPending}
            />
          </TabsContent>
          <TabsContent value="text">
            <Input
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder={t("textPlaceholder")}
              className="h-12 text-base"
              disabled={isPending}
            />
          </TabsContent>

          <AnimatePresence mode="wait">
            {isPending ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 flex flex-col items-center gap-4"
              >
                <div className="relative">
                  <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center">
                    <ShieldAlert className="h-8 w-8 text-amber-500 animate-pulse" />
                  </div>
                  <Loader2 className="absolute -right-1 -top-1 h-5 w-5 animate-spin text-amber-500" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {locale === "de" ? currentStep?.de : currentStep?.en}
                </p>
                <div className="flex gap-1">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 w-8 rounded-full transition-all duration-500 ${
                        i <= step ? "bg-amber-500" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div key="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full mt-4 h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/25 gap-2"
                  disabled={isPending || !(tab === "url" ? urlValue.trim() : textValue.trim())}
                >
                  <Search className="h-4 w-4" />
                  {t("checkButton")}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </Tabs>

      <p className="mt-3 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
        {t("freeNote")}
      </p>
    </motion.div>
  );
}
