import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import {
  createProject,
  deleteProject,
  getCompanies,
  getProjectById,
  getProjectsWithCompany,
  updateProject,
} from '@/lib/db';

export async function GET(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const projects = getProjectsWithCompany();
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const { companyId, name, slug, description, orderIndex } = await request.json();
    const parsedCompanyId = Number(companyId);

    if (
      Number.isNaN(parsedCompanyId) ||
      parsedCompanyId <= 0 ||
      !name ||
      !slug
    ) {
      return NextResponse.json(
        { error: 'Company, name and slug are required' },
        { status: 400 }
      );
    }

    const companies = getCompanies();
    const companyExists = companies.some((company) => company.id === parsedCompanyId);

    if (!companyExists) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    const project = createProject(
      parsedCompanyId,
      name,
      slug,
      description,
      Number(orderIndex) || 0
    );
    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        { error: 'Project with this slug already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const { id, companyId, name, slug, description, orderIndex } = await request.json();
    const parsedCompanyId = Number(companyId);

    if (
      !id ||
      Number.isNaN(parsedCompanyId) ||
      parsedCompanyId <= 0 ||
      !name ||
      !slug
    ) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const project = getProjectById(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const companies = getCompanies();
    const companyExists = companies.some((company) => company.id === parsedCompanyId);

    if (!companyExists) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    updateProject(
      id,
      parsedCompanyId,
      name,
      slug,
      description ?? null,
      Number(orderIndex) || 0
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        { error: 'Project with this slug already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update project' },
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

    deleteProject(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}


