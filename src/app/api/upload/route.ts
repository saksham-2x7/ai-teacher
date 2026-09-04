import { NextRequest, NextResponse } from 'next/server';
import { processDocument } from '@/lib/rag';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Process document and generate chunks with embeddings
    const chunks = await processDocument(buffer, file.type);

    // Create material record
    const material = await prisma.material.create({
      data: {
        userId: session.user.id as string,
        title: title || file.name,
        content: 'File uploaded and processed', // In a real app, store to S3/R2 and save URL
        type: file.type === 'application/pdf' ? 'PDF' : 'TEXT',
      },
    });

    // TODO: Store chunks and embeddings in pgvector using a raw Prisma query

    return NextResponse.json({
      success: true,
      materialId: material.id,
      chunksProcessed: chunks.length,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to process upload' }, { status: 500 });
  }
}
