import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? "PUBLISHED";
    const companyId = searchParams.get("companyId");
    const page = Number(searchParams.get("page") ?? "1");
    const limit = Number(searchParams.get("limit") ?? "20");

    const where = {
      ...(status && { status: status as "PUBLISHED" | "DRAFT" | "PAUSED" | "CLOSED" }),
      ...(companyId && { companyId }),
    };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: { company: { select: { companyName: true, logoUrl: true, location: true } }, skills: { include: { skill: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.job.count({ where }),
    ]);

    return NextResponse.json({ jobs, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("[jobs GET]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title, description, requirements, benefits, location, remote, salaryMin, salaryMax,
      contractType, experienceLevel, status,
      reqLeadership, reqOrganization, reqCommunication, reqCreativity,
      reqExecution, reqCollaboration, reqResilience, reqAdaptability,
      companyId,
    } = body;

    if (!title || !description || !companyId) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
    }

    const job = await prisma.job.create({
      data: {
        companyId, title, description,
        requirements: requirements ?? null,
        benefits: benefits ?? null,
        location: location ?? null,
        remote: remote ?? false,
        salaryMin: salaryMin ? Number(salaryMin) : null,
        salaryMax: salaryMax ? Number(salaryMax) : null,
        contractType: contractType ?? null,
        experienceLevel: experienceLevel ?? null,
        status: status ?? "DRAFT",
        reqLeadership: reqLeadership ?? 50,
        reqOrganization: reqOrganization ?? 50,
        reqCommunication: reqCommunication ?? 50,
        reqCreativity: reqCreativity ?? 50,
        reqExecution: reqExecution ?? 50,
        reqCollaboration: reqCollaboration ?? 50,
        reqResilience: reqResilience ?? 50,
        reqAdaptability: reqAdaptability ?? 50,
      },
    });

    return NextResponse.json({ id: job.id }, { status: 201 });
  } catch (err) {
    console.error("[jobs POST]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
