import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aptiva AI — Onde aptidão encontra oportunidade.",
  description: "Plataforma SaaS de recrutamento e seleção baseada em Inteligência Artificial. Identifique perfis cognitivos, comportamentais e técnicos.",
  keywords: ["recrutamento", "seleção", "inteligência artificial", "talentos", "RH", "DISC", "Big Five"],
  openGraph: {
    title: "Aptiva AI",
    description: "Onde aptidão encontra oportunidade.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-light-bg text-dark-bg antialiased">
        {children}
      </body>
    </html>
  );
}
