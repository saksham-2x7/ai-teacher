import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen, TrendingUp, Clock, PlusCircle } from 'lucide-react';

import { ProgressChart } from "@/components/dashboard/ProgressChart";
import prisma from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  // Fetch real progress data for the user
  const progressRecords = await prisma.progress.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    take: 7,
  });

  const chartData = progressRecords.map((p) => ({
    name: p.topic.substring(0, 10), // Truncate for chart
    score: p.score,
  }));

  // Mock data if none exists
  const finalChartData = chartData.length > 0 ? chartData : [
    { name: 'Mon', score: 65 },
    { name: 'Tue', score: 70 },
    { name: 'Wed', score: 68 },
    { name: 'Thu', score: 75 },
    { name: 'Fri', score: 85 },
  ];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Link href="/lesson/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Lesson
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lessons Completed</CardTitle>
            <BookOpen className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-muted-foreground text-xs">+2 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-muted-foreground text-xs">+5% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14h 30m</div>
            <p className="text-muted-foreground text-xs">+2h from last week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your learning journey over the past 30 days.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ProgressChart data={finalChartData} />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Up Next</CardTitle>
            <CardDescription>Recommended based on your performance.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Recommendation items */}
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm leading-none font-medium">Review: Newton's Laws</p>
                  <p className="text-muted-foreground text-sm">Physics • Needs Improvement</p>
                </div>
                <div className="ml-auto font-medium">
                  <Link href="/lesson/newtons-laws">
                    <Button variant="outline" size="sm">
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
