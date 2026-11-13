"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ViewerLazy from "./ViewerLazy";
import { lessons } from "@/lib/lessons";
import { useProgress } from "@/lib/progress";

const FINAL = 9;

export default function HeroScene() {
  const [stage, setStage] = useState(0);
  const { done } = useProgress();
  useEffect(() => {
    if (stage >= FINAL) return;
    const t = setTimeout(() => setStage((s) => s + 1), stage === 0 ? 900 : 1150);
    return () => clearTimeout(t);
  }, [stage]);

  const next = lessons.find((l) => !done.includes(l.slug)) ?? lessons[0];
  const pct = Math.round((stage / FINAL) * 100);

  return (
    <section className="hero">
      <div className="hero-canvas">
        <ViewerLazy stage={stage} style={stage >= FINAL ? "realistic" : "shaded"} datums={stage < 5} camera={[25, 13, 21]} zoom={false} sky={false} />
      </div>
      <div className="container">
        <div className="hero-content">
          <span className="eyebrow">
            <span className="dot" /> מסלול אישי · ניר מימון
          </span>
          <h1>
            לומדים <span className="grad-text">Revit</span>
            <br />
            בונים בית אמיתי.
          </h1>
          <p className="lead">
            13 שיעורים ויזואליים שלוקחים אותך מהמסך הראשון ועד גיליון מוכן להדפסה. בכל שיעור המודל התלת־ממדי
            מתעדכן — קירות, פתחים, גג, מדרגות, חומרים וחתכים — בדיוק כמו בתוכנה.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href={`/lessons/${next.slug}/`}>
              {done.length ? "להמשיך מאיפה שעצרתי" : "להתחיל ללמוד"} ←
            </Link>
            <a className="btn btn-ghost" href="#path">
              לכל המסלול
            </a>
          </div>
          <div className="build-meter">
            <div className="label">
              <b>{stage >= FINAL ? "הבית מוכן ✓" : lessons[stage].en}</b>
              {stage >= FINAL ? "גררו כדי לסובב את המודל" : `שלב ${stage + 1} — ${lessons[stage].title}`}
            </div>
            <div className="bar">
              <span style={{ width: `${pct}%` }} />
            </div>
            <span className="mono" style={{ fontSize: 13 }}>{pct}%</span>
          </div>
        </div>
      </div>
    </section>
  );
}
