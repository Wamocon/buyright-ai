"use client";

import { useState, useCallback, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link2,
  Type,
  Image as ImageIcon,
  Upload,
  X,
  ArrowRight,
  Loader2,
  Sparkles,
  CheckCircle2,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { analyzeAction } from "@/actions/analyze";
import { UPLOAD_CONFIG } from "@/config/constants";
import type { AnalysisResult, InputType } from "@/types";
import { toast } from "sonner";

interface AnalysisFormProps {
  onResult: (result: AnalysisResult) => void;
}

const analysisSteps = [
  "Identifying product...",
  "Analyzing reviews and quality...",
  "Checking risks and scam indicators...",
  "Finding better alternatives...",
  "Generating recommendation...",
];

export function AnalysisForm({ onResult }: AnalysisFormProps) {
  const searchParams = useSearchParams();
  const initialType = (searchParams.get("type") as InputType) || "url";
  const initialQuery = searchParams.get("q") ?? "";

  const [activeTab, setActiveTab] = useState<string>(initialType);
  const [urlValue, setUrlValue] = useState(initialType === "url" ? initialQuery : "");
  const [textValue, setTextValue] = useState(initialType === "text" ? initialQuery : "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageFile = useCallback((file: File) => {
    if (!UPLOAD_CONFIG.acceptedFormats.includes(file.type as typeof UPLOAD_CONFIG.acceptedFormats[number])) {
      toast.error("Please upload a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > UPLOAD_CONFIG.maxSizeBytes) {
      toast.error("Image must be under 10MB.");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleImageDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  }, [handleImageFile]);

  function clearImage() {
    setImageFile(null);
    setImagePreview(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsAnalyzing(true);
    setCurrentStep(0);

    // Animate through steps
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => Math.min(prev + 1, analysisSteps.length - 1));
    }, 1500);

    const formData = new FormData();
    formData.set("type", activeTab);

    if (activeTab === "url") {
      formData.set("value", urlValue);
    } else if (activeTab === "text") {
      formData.set("value", textValue);
    } else if (activeTab === "image" && imageFile) {
      formData.set("value", imageFile.name);
      // Convert image to base64 for AI analysis
      if (imagePreview) {
        formData.set("imageUrl", imagePreview);
      }
    }

    startTransition(async () => {
      try {
        const result = await analyzeAction(formData);
        clearInterval(stepInterval);

        if (result.success && result.data) {
          setCurrentStep(analysisSteps.length - 1);
          setTimeout(() => {
            setIsAnalyzing(false);
            onResult(result.data!);
          }, 500);
        } else if (result.rateLimitExceeded) {
          setIsAnalyzing(false);
          toast.error("Daily limit reached. Upgrade to Pro for unlimited analyses.");
        } else {
          setIsAnalyzing(false);
          toast.error(result.error ?? "Analysis failed. Please try again.");
        }
      } catch {
        clearInterval(stepInterval);
        setIsAnalyzing(false);
        toast.error("An unexpected error occurred. Please try again.");
      }
    });
  }

  if (isAnalyzing) {
    return <AnalysisLoadingState currentStep={currentStep} />;
  }

  return (
    <Card className="mx-auto max-w-2xl border-2 border-indigo-100 dark:border-indigo-900/30 shadow-xl shadow-indigo-500/5">
      <CardContent className="p-6 md:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Analyze a Product</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Paste a URL, type a product name, or upload an image
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="url" className="gap-2">
              <Link2 className="h-4 w-4" />
              <span className="hidden sm:inline">URL</span>
            </TabsTrigger>
            <TabsTrigger value="text" className="gap-2">
              <Type className="h-4 w-4" />
              <span className="hidden sm:inline">Text</span>
            </TabsTrigger>
            <TabsTrigger value="image" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Image</span>
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="url" className="mt-0">
              <Input
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                placeholder="https://amazon.de/dp/B0EXAMPLE..."
                className="h-12"
              />
            </TabsContent>

            <TabsContent value="text" className="mt-0">
              <Textarea
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                placeholder="e.g. iPhone 16 Pro Max 256GB Black"
                className="min-h-[80px] resize-none"
                maxLength={500}
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">
                {textValue.length}/500
              </p>
            </TabsContent>

            <TabsContent value="image" className="mt-0">
              {imagePreview ? (
                <div className="relative rounded-xl border-2 border-dashed border-indigo-200 p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="mx-auto max-h-48 rounded-lg object-contain"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={clearImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleImageDrop}
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-indigo-200 p-8 text-center transition-colors hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-indigo-800 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/20"
                >
                  <Upload className="mb-3 h-8 w-8 text-indigo-400" />
                  <p className="text-sm font-medium">
                    Drag & drop an image here
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    JPG, PNG, WebP - max 10MB
                  </p>
                  <label className="mt-3">
                    <Button type="button" variant="outline" size="sm" render={<span />}>
                      Choose File
                    </Button>
                    <input
                      type="file"
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageFile(file);
                      }}
                    />
                  </label>
                </div>
              )}
            </TabsContent>

            <Button
              type="submit"
              disabled={
                isPending ||
                (activeTab === "url" && !urlValue.trim()) ||
                (activeTab === "text" && !textValue.trim()) ||
                (activeTab === "image" && !imageFile)
              }
              className="mt-6 w-full h-12 bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-violet-700"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Analyze Product
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function AnalysisLoadingState({ currentStep }: { currentStep: number }) {
  return (
    <Card className="mx-auto max-w-2xl border-2 border-indigo-100 dark:border-indigo-900/30 shadow-xl shadow-indigo-500/5">
      <CardContent className="p-8 md:p-12">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25"
          >
            <Sparkles className="h-8 w-8 text-white" />
          </motion.div>
          <h3 className="text-xl font-bold">AI is analyzing your product...</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            This usually takes 5-10 seconds
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <AnimatePresence>
            {analysisSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: i <= currentStep ? 1 : 0.3,
                  x: 0,
                }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
                className="flex items-center gap-3"
              >
                {i < currentStep ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                ) : i === currentStep ? (
                  <Loader2 className="h-5 w-5 shrink-0 animate-spin text-indigo-500" />
                ) : (
                  <div className="h-5 w-5 shrink-0 rounded-full border-2 border-muted" />
                )}
                <span
                  className={`text-sm ${
                    i <= currentStep
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {step}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="mt-8">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600"
              initial={{ width: "0%" }}
              animate={{
                width: `${((currentStep + 1) / analysisSteps.length) * 100}%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
