import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen, TrendingUp, Clock, PlusCircle } from 'lucide-react';

import { ProgressChart } from '@/components/dashboard/ProgressChart';
import prisma from '@/lib/prisma';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Fetch real progress data for the user
  const progressRecords = await prisma.progress.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'asc' },
    take: 7,
  });

  const chartData = progressRecords.map((p) => ({
    name: p.topic.substring(0, 10), // Truncate for chart
    score: p.score,
  }));

  // Mock data if none exists
  const finalChartData =
    chartData.length > 0
      ? chartData
      : [
          { name: 'Mon', score: 65 },
          { name: 'Tue', score: 70 },
          { name: 'Wed', score: 68 },
          { name: 'Thu', score: 75 },
          { name: 'Fri', score: 85 },
        ];

  return (
    <div className="min-h-screen flex-1 space-y-8 bg-[#0a0a0c] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] p-8 pt-10">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
            Dashboard
          </h2>
          <p className="mt-2 text-zinc-400">Welcome back. Here&apos;s your learning progress.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/lesson/new">
            <Button className="rounded-full border-0 bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:bg-blue-700">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Lesson
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/[0.05] bg-white/[0.02] backdrop-blur-xl transition-colors hover:bg-white/[0.04]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Lessons Completed</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">12</div>
            <p className="mt-1 flex items-center text-xs text-green-400">
              <TrendingUp className="mr-1 h-3 w-3" /> +2 from last week
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/[0.05] bg-white/[0.02] backdrop-blur-xl transition-colors hover:bg-white/[0.04]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">85%</div>
            <p className="mt-1 flex items-center text-xs text-green-400">
              <TrendingUp className="mr-1 h-3 w-3" /> +5% from last week
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/[0.05] bg-white/[0.02] backdrop-blur-xl transition-colors hover:bg-white/[0.04]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">14h 30m</div>
            <p className="mt-1 flex items-center text-xs text-green-400">
              <TrendingUp className="mr-1 h-3 w-3" /> +2h from last week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-white/[0.05] bg-white/[0.02] backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <CardDescription className="text-zinc-400">
              Your learning journey over the past 30 days.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ProgressChart data={finalChartData} />
          </CardContent>
        </Card>

        <Card className="col-span-3 border-white/[0.05] bg-white/[0.02] backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">Up Next</CardTitle>
            <CardDescription className="text-zinc-400">
              Recommended based on your performance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="group flex items-center rounded-xl p-3 transition-all hover:bg-white/[0.05]">
                <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20">
                  <BookOpen className="h-5 w-5 text-blue-400" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm leading-none font-medium text-white transition-colors group-hover:text-blue-400">
                    Review: Newton&apos;s Laws
                  </p>
                  <p className="text-sm text-zinc-500">Physics • Needs Improvement</p>
                </div>
                <div className="ml-auto font-medium">
                  <Link href="/lesson/demo">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-white/10 hover:bg-white/10"
                    >
                      Start
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
