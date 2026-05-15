import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <div className="text-7xl font-bold text-muted-foreground/20">404</div>
        <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-6 flex gap-3">
          <Button nativeButton={false} render={<Link href="/" />}>
            Go Home
          </Button>
          <Button variant="outline" nativeButton={false} render={<Link href="/analyze" />}>
            <Search className="mr-2 h-4 w-4" />
            Analyze a Product
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
