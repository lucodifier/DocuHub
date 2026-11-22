import { NextResponse } from 'next/server';
import { getAllDocuments, createDocument } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const documents = getAllDocuments();
    return NextResponse.json(documents);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { title, slug, categoryId, projectId, content, orderIndex } = await request.json();

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const document = createDocument(title, slug, categoryId ?? null, projectId ?? null, content, orderIndex || 0);
    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}

