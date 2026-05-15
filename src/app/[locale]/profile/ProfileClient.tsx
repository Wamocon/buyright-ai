"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  User,
  Mail,
  Crown,
  Shield,
  BarChart3,
  Calendar,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/navigation";

interface ProfileClientProps {
  user: { id: string; email: string };
  profile: {
    full_name: string;
    avatar_url: string | null;
    subscription_tier: string;
    subscription_status: string | null;
    daily_checks_used: number;
    created_at: string | null;
  };
  totalChecks: number;
  dailyLimit: number;
  isPro: boolean;
}

export function ProfileClient({
  user,
  profile,
  totalChecks,
  dailyLimit,
  isPro,
}: ProfileClientProps) {
  const t = useTranslations("profile");

  const [fullName, setFullName] = useState(profile.full_name);
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const userInitials = user.email.slice(0, 2).toUpperCase();

  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
      })
    : null;

  async function handleSaveProfile() {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t("savedSuccess"));
    }
  }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      toast.error(t("passwordMismatch"));
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setChangingPassword(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t("passwordUpdated"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  const checksUsedPercent = Math.min(
    (profile.daily_checks_used / dailyLimit) * 100,
    100
  );

  return (
    <div className="space-y-6">
      {/* Account overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xl font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold truncate">
                  {profile.full_name || user.email.split("@")[0]}
                </h2>
                {isPro ? (
                  <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0">
                    <Crown className="h-3 w-3 mr-1" />
                    Pro
                  </Badge>
                ) : (
                  <Badge variant="secondary">Free</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              {memberSince && (
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {t("memberSince")} {memberSince}
                </p>
              )}
            </div>
            <div className="text-center hidden sm:block">
              <p className="text-2xl font-bold">{totalChecks}</p>
              <p className="text-xs text-muted-foreground">{t("totalChecks")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage today */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4 text-indigo-500" />
            {t("usage")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {t("checksUsed", {
                  used: profile.daily_checks_used,
                  total: isPro ? "∞" : String(dailyLimit),
                })}
              </span>
              <span className="font-medium">
                {Math.round(checksUsedPercent)}%
              </span>
            </div>
            {!isPro && (
              <Progress value={checksUsedPercent} className="h-2" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Personal Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4 text-indigo-500" />
            {t("personalInfo")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">{t("fullName")}</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t("fullNamePlaceholder")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              {t("email")}
            </Label>
            <Input id="email" value={user.email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">{t("emailNote")}</p>
          </div>
          <Button onClick={handleSaveProfile} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("saving")}
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {t("saveChanges")}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Crown className="h-4 w-4 text-amber-500" />
            {t("subscription")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("currentPlan")}</p>
              <p className="mt-0.5 text-lg font-bold">
                {isPro ? t("proPlan") : t("freePlan")}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {isPro ? t("proDesc") : t("freeDesc")}
              </p>
            </div>
            {!isPro && (
              <Button
                className="shrink-0 bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600 border-0"
                nativeButton={false} render={<Link href="/#pricing" />}
              >
                <Crown className="h-4 w-4 mr-2" />
                {t("upgradeToPro")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security / Change Password */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4 text-indigo-500" />
            {t("security")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{t("changePassword")}</p>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="newPw">{t("newPassword")}</Label>
              <Input
                id="newPw"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPw">{t("confirmPassword")}</Label>
              <Input
                id="confirmPw"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleChangePassword}
            disabled={changingPassword || !newPassword || !confirmPassword}
          >
            {changingPassword ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t("saving")}</>
            ) : (
              <><Shield className="h-4 w-4 mr-2" />{t("updatePassword")}</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-200 dark:border-red-900/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-red-500">
            <AlertTriangle className="h-4 w-4" />
            {t("dangerZone")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{t("deleteWarning")}</p>
          <Separator className="mb-4" />
          <Button
            variant="outline"
            className="border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600 dark:border-red-800 dark:hover:bg-red-950"
            onClick={() => toast.error("Please contact support to delete your account.")}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            {t("deleteAccount")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
