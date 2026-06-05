import dotenv from "dotenv";
import path from "path";
import { defineConfig } from "prisma/config";

// Carrega .env.local (Next.js) para o Prisma CLI
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
// Fallback para .env se .env.local não existir
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DIRECT_URL!,
  },
});
