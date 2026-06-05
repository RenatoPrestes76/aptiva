import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerSupabase } from "@/lib/supabase";
import { slugify } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 });
    }
    if (!["CANDIDATE", "COMPANY"].includes(role)) {
      return NextResponse.json({ error: "Tipo de conta inválido" }, { status: 400 });
    }

    const supabase = createServerSupabase();
    const { data, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const slug = slugify(name) + "-" + Math.random().toString(36).slice(2, 6);

    const user = await prisma.user.create({
      data: {
        supabaseId: data.user.id,
        email,
        name,
        role,
        publicSlug: slug,
        ...(role === "CANDIDATE" ? { candidate: { create: {} } } : {}),
        ...(role === "COMPANY" ? { company: { create: { companyName: name } } } : {}),
      },
    });

    return NextResponse.json({ id: user.id, role: user.role }, { status: 201 });
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
