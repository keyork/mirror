import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '镜 | Mirror',
  description: '一面会成长的镜子，帮人从活在惯性里走向活在选择里。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
