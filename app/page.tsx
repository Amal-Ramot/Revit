import HeroScene from "@/components/HeroScene";
import PathGrid from "@/components/PathGrid";
import { lessons, allShortcuts } from "@/lib/lessons";
import Link from "next/link";

const views = [
  { label: "תוכנית", en: "Plan", x: 50, y: 6 },
  { label: "חזית", en: "Elevation", x: 92, y: 36 },
  { label: "חתך", en: "Section", x: 80, y: 86 },
  { label: "תלת־ממד", en: "3D View", x: 20, y: 86 },
  { label: "טבלה", en: "Schedule", x: 8, y: 36 },
];

export default function Home() {
  const totalSteps = lessons.reduce((a, l) => a + l.steps.length, 0);
  return (
    <>
      <HeroScene />

      <div className="container">
        <div className="stats">
          <div className="stat"><b className="grad-text">{lessons.length}</b><span>שיעורים מודרכים</span></div>
          <div className="stat"><b className="grad-text">{totalSteps}</b><span>שלבי עבודה בתוכנה</span></div>
          <div className="stat"><b className="grad-text">{allShortcuts.length}</b><span>קיצורי מקלדת</span></div>
          <div className="stat"><b className="grad-text">3D</b><span>מודל חי בכל שיעור</span></div>
        </div>
      </div>

      <section className="block" id="path">
        <div className="container">
          <div className="section-head">
            <span className="kicker">The Learning Path</span>
            <h2>המסלול המלא — מהקיר הראשון ועד ההגשה</h2>
            <p>כל שיעור מוסיף שכבה לאותו בית. ההתקדמות שלך נשמרת בדפדפן, כך שאפשר לחזור בכל רגע ולהמשיך.</p>
          </div>
          <PathGrid />
        </div>
      </section>

      <section className="block">
        <div className="container flow">
          <div className="section-head" style={{ marginBottom: 0 }}>
            <span className="kicker">Why BIM</span>
            <h2>מודל אחד. כל התצוגות מתעדכנות לבד.</h2>
            <p>
              ב־Revit לא משרטטים קווים — בונים בניין וירטואלי. תוכניות, חזיתות, חתכים, הדמיות וטבלאות כמויות הם רק
              &quot;חלונות&quot; שונים לאותו מודל. מזיזים קיר בתוכנית — והוא זז בחזית, בחתך ובטבלה. זה הרעיון הכי חשוב שתלמד
              במסלול הזה.
            </p>
            <div style={{ marginTop: 26 }}>
              <Link className="btn btn-ghost" href="/lessons/views/">לשיעור התצוגות ←</Link>
            </div>
          </div>
          <div className="flow-diagram">
            <div className="flow-ring" />
            <div className="flow-center">
              BIM
              <br />
              <span style={{ fontSize: 13, fontWeight: 500 }}>Single Model</span>
            </div>
            {views.map((v) => (
              <div key={v.en} className="flow-node" style={{ left: `${v.x}%`, top: `${v.y}%` }}>
                {v.label}
                <small>{v.en}</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 20 }}>
        <div className="container">
          <div className="features">
            <div className="feature">
              <div className="ico">🧱</div>
              <h3>מודל תלת־ממדי חי</h3>
              <p>סובבו, התקרבו והחליפו סגנון תצוגה — Wireframe, Hidden Line, Shaded ו־Realistic — כמו בסרגל התצוגה של Revit.</p>
            </div>
            <div className="feature">
              <div className="ico">⌨️</div>
              <h3>קיצורים בכל שלב</h3>
              <p>כל פעולה מגיעה עם קיצור המקלדת שלה. עמוד קיצורים מלא עם חיפוש — להדפיס ולתלות ליד המסך.</p>
            </div>
            <div className="feature">
              <div className="ico">🎯</div>
              <h3>בוחן קצר בסוף</h3>
              <p>שאלה אחת שבודקת את ההבנה של הרעיון המרכזי בשיעור, עם הסבר — כדי שהידע באמת יישאר.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
