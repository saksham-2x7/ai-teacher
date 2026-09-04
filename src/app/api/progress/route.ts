import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { topic, score, weakAreas, strongAreas } = body;

    const progress = await prisma.progress.create({
      data: {
        userId: session.user.id as string,
        topic,
        score,
        weakAreas: JSON.stringify(weakAreas),
        strongAreas: JSON.stringify(strongAreas),
      },
    });

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error('Progress save error:', error);
    return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
  }
}
