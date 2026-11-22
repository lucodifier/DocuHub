import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import {
  getAllDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
} from '@/lib/db';

export async function GET(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;

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

export async function POST(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const { title, slug, categoryId, projectId, content, orderIndex } = await request.json();
    const parsedProjectId = Number(projectId);

    if (
      !title ||
      !slug ||
      Number.isNaN(parsedProjectId) ||
      parsedProjectId <= 0 ||
      !content
    ) {
      return NextResponse.json(
        { error: 'Title, slug, project, and content are required' },
        { status: 400 }
      );
    }

    const document = createDocument(
      title,
      slug,
      categoryId ?? null,
      parsedProjectId,
      content,
      orderIndex || 0
    );
    return NextResponse.json(document, { status: 201 });
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        { error: 'Document with this slug already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const { id, title, slug, categoryId, projectId, content, orderIndex } = await request.json();
    const parsedProjectId = Number(projectId);

    if (
      !id ||
      !title ||
      !slug ||
      Number.isNaN(parsedProjectId) ||
      parsedProjectId <= 0 ||
      !content
    ) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    updateDocument(id, title, slug, categoryId ?? null, parsedProjectId, content, orderIndex || 0);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    deleteDocument(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}

