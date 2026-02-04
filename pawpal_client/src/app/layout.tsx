import type { Metadata } from "next";
import { Nunito } from "next/font/google"; // Use Nunito as requested
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"], // Regular, Medium, SemiBold, Bold, ExtraBold
  display: 'swap',
});

export const metadata: Metadata = {
  title: "PawPal - Your Pet Care Assistant",
  description: "A caring friend helping you take care of your pet.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${nunito.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
