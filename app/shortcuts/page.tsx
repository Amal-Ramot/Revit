import type { Metadata } from "next";
import ShortcutsBoard from "@/components/ShortcutsBoard";

export const metadata: Metadata = { title: "קיצורי מקלדת · Revit Academy" };

export default function ShortcutsPage() {
  return (
    <section className="block" style={{ paddingTop: 60 }}>
      <div className="container">
        <div className="section-head">
          <span className="kicker">Keyboard Shortcuts</span>
          <h2>כל הקיצורים במקום אחד</h2>
          <p>ב־Revit מקלידים שתי אותיות בכל רגע — בלי Enter. חפשו לפי קיצור או לפי פעולה בעברית.</p>
        </div>
        <ShortcutsBoard />
      </div>
    </section>
  );
}
