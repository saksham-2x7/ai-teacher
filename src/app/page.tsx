import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="flex h-14 items-center border-b px-4 lg:px-6">
        <Link className="flex items-center justify-center" href="#">
          <span className="text-xl font-bold tracking-tight">AI Teacher</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <Link className="text-sm font-medium underline-offset-4 hover:underline" href="#features">
            Features
          </Link>
          <Link href="/login">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="flex w-full justify-center bg-zinc-50 py-12 md:py-24 lg:py-32 xl:py-48 dark:bg-zinc-950">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Your Personal AI Educator
                </h1>
                <p className="mx-auto max-w-[700px] text-zinc-500 md:text-xl dark:text-zinc-400">
                  Upload any textbook, notes, or topic. Experience a human-like interactive learning
                  session tailored to your skill level.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/login">
                  <Button size="lg">Get Started</Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" size="lg">
                    View Dashboard
                  </Button>
                </Link>
                <Link href="/lesson/demo">
                  <Button variant="secondary" size="lg">
                    Try a Lesson
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t px-4 py-6 sm:flex-row md:px-6">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">© 2026 AI Teacher. Open Source.</p>
      </footer>
    </div>
  );
}
