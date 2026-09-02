import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Western Frontier — Town v46",
  description:
    "Western Frontier 3D Game — Part 3: Town. A WebGL2 western town exploration game.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, overflow: "hidden" }}>
        {children}
      </body>
    </html>
  );
}
