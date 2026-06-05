import { supabase } from "./supabase";
import { prisma } from "./prisma";
import { slugify } from "./utils";

export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  return prisma.user.findUnique({
    where: { supabaseId: session.user.id },
    include: {
      candidate: true,
      company: true,
      adminProfile: true,
    },
  });
}

export async function signUp(email: string, password: string, name: string, role: "CANDIDATE" | "COMPANY") {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error("Erro ao criar usuário");

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

  return user;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}
