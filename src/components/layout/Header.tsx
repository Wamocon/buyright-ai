"use client";

import { usePathname, Link, useRouter } from "@/navigation";
import { AnimatedLogo } from "@/components/AnimatedLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Menu, X, LayoutDashboard, User, LogOut, Crown } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      if (data.user) {
        supabase
          .from("profiles")
          .select("subscription_tier")
          .eq("id", data.user.id)
          .single()
          .then(({ data: profile }) => {
            setIsPro(profile?.subscription_tier === "pro");
          });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from("profiles")
          .select("subscription_tier")
          .eq("id", session.user.id)
          .single()
          .then(({ data: profile }) => {
            setIsPro(profile?.subscription_tier === "pro");
          });
      } else {
        setIsPro(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setIsPro(false);
    router.push("/");
    router.refresh();
  }

  const userInitials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "U";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isLanding = pathname === "/";

  const navLinks = [
    { href: "/#features", label: t("features") },
    { href: "/#pricing", label: t("pricing") },
    { href: "/analyze", label: t("analyze") },
    { href: "/compare", label: t("compare") },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-border/50 bg-background/85 backdrop-blur-xl shadow-sm shadow-black/5"
          : isLanding
          ? "bg-transparent"
          : "border-b border-border/50 bg-background/85 backdrop-blur-xl"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <AnimatedLogo size="sm" />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <LanguageSwitcher />
          <ThemeToggle />
          <div className="hidden md:flex md:items-center md:gap-1.5 md:ml-1">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<button className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent" />}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[120px] truncate text-sm font-medium">
                    {user.user_metadata?.full_name ?? user.email?.split("@")[0]}
                  </span>
                  {isPro && (
                    <Badge className="h-5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] px-1.5 border-0">
                      <Crown className="h-2.5 w-2.5 mr-0.5" />PRO
                    </Badge>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-2 py-1.5">
                    <p className="text-xs font-medium text-foreground truncate">{user.email}</p>
                    <p className="text-xs text-muted-foreground">{isPro ? "Pro Plan" : "Free Plan"}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/dashboard")} className="flex items-center gap-2 cursor-pointer">
                    <LayoutDashboard className="h-4 w-4" />
                    {t("dashboard")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/profile")} className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    {t("profile")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-red-500 cursor-pointer focus:text-red-500">
                    <LogOut className="h-4 w-4" />
                    {t("signOut")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/login" />}>
                  {t("login")}
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-600 hover:to-violet-700 shadow-md shadow-indigo-500/20 transition-all duration-200"
                  nativeButton={false} render={<Link href="/analyze" />}
                >
                  {t("startAnalysis")}
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden">
                  <motion.div
                    animate={{ rotate: open ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </motion.div>
                </Button>
              }
            />
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex flex-col gap-6 pt-8">
                <AnimatedLogo size="sm" />
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-3 py-2.5 text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="flex flex-col gap-2 border-t pt-4">
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 px-1 pb-2">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-semibold">
                            {userInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{user.email?.split("@")[0]}</p>
                          <p className="text-xs text-muted-foreground">{isPro ? "Pro Plan" : "Free Plan"}</p>
                        </div>
                      </div>
                      <Button variant="outline" nativeButton={false} render={<Link href="/dashboard" onClick={() => setOpen(false)} />}>
                        <LayoutDashboard className="h-4 w-4 mr-2" />{t("dashboard")}
                      </Button>
                      <Button variant="outline" nativeButton={false} render={<Link href="/profile" onClick={() => setOpen(false)} />}>
                        <User className="h-4 w-4 mr-2" />{t("profile")}
                      </Button>
                      <Button
                        variant="outline"
                        className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-900 dark:hover:bg-red-950"
                        onClick={() => { setOpen(false); handleSignOut(); }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />{t("signOut")}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        nativeButton={false} render={<Link href="/login" onClick={() => setOpen(false)} />}
                      >
                        {t("login")}
                      </Button>
                      <Button
                        className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white"
                        nativeButton={false} render={<Link href="/analyze" onClick={() => setOpen(false)} />}
                      >
                        {t("startAnalysis")}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
