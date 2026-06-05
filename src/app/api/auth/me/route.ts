import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerSupabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const supabase = createServerSupabase();
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { candidate: true, company: true },
    });
    if (!dbUser) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    return NextResponse.json({ id: dbUser.id, name: dbUser.name, role: dbUser.role, email: dbUser.email });
  } catch (err) {
    console.error("[me]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
