import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Central Park - IoT Plant Monitor',
  description: 'Real-time plant monitoring system with sensor data and remote controls',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-stone-100">
        {children}
      </body>
    </html>
  );
}
