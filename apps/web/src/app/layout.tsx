import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NutriAX Pro — Painel do Nutricionista',
  description: 'Plataforma profissional de acompanhamento nutricional com prescrição assistida por IA.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
