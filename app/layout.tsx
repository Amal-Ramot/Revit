import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Revit Academy · מסלול הלמידה של ניר מימון",
  description: "מסלול אינטראקטיבי ללימוד Revit שלב אחרי שלב — עם מודל תלת־ממדי חי שנבנה יחד איתך.",
};

export const viewport: Viewport = { themeColor: "#050a14" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700;800&display=swap"
        />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <footer className="footer">
          <div className="container">
            <span>Revit Academy — נבנה במיוחד עבור <b style={{ color: "var(--text)" }}>ניר מימון</b></span>
            <span className="mono">BIM · Model once, document everywhere</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
