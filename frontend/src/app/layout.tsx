import type { Metadata } from "next";
import "./globals.css";
import { ThemeToggle } from '@/components/ThemeToggle';


export const metadata: Metadata = {
  title: "Finance Tracker",
  description: "Track your finance on the easy way",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className='bg-gray-50 text-gray-900'
      >
      <header className="p-4 flex justify-end">
        <ThemeToggle />
      </header><main>

        {children}
      </main>
      </body>
    </html>
  );
}
