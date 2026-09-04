import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link className="flex items-center justify-center" href="#">
          <span className="font-bold text-xl tracking-tight">AI Teacher</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
            Features
          </Link>
          <Link href="/login">
            <Button variant="outline" size="sm">Sign In</Button>
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex justify-center bg-zinc-50 dark:bg-zinc-950">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Your Personal AI Educator
                </h1>
                <p className="mx-auto max-w-[700px] text-zinc-500 md:text-xl dark:text-zinc-400">
                  Upload any textbook, notes, or topic. Experience a human-like interactive learning session tailored to your skill level.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/login">
                  <Button size="lg">Get Started</Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" size="lg">View Dashboard</Button>
                </Link>
                <Link href="/lesson/demo">
                  <Button variant="secondary" size="lg">Try a Lesson</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">© 2026 AI Teacher. Open Source.</p>
      </footer>
    </div>
  );
}
