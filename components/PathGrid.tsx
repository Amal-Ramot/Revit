"use client";

import Link from "next/link";
import { lessons } from "@/lib/lessons";
import { useProgress } from "@/lib/progress";

export default function PathGrid() {
  const { done } = useProgress();
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22, color: "var(--muted)" }}>
        <div style={{ flex: 1, height: 6, borderRadius: 9, background: "rgba(148,197,255,.1)", overflow: "hidden" }}>
          <div
            style={{
              width: `${(done.length / lessons.length) * 100}%`,
              height: "100%",
              background: "linear-gradient(90deg,#34d399,#38bdf8)",
              transition: "width .6s",
            }}
          />
        </div>
        <span className="mono">
          {done.length}/{lessons.length} הושלמו
        </span>
      </div>
      <div className="path">
        {lessons.map((l, i) => (
          <Link
            key={l.slug}
            href={`/lessons/${l.slug}/`}
            className="card"
            style={{ ["--c" as string]: l.color }}
          >
            <span className="num">{String(i + 1).padStart(2, "0")}</span>
            <span className="en">{l.en}</span>
            <h3>{l.title}</h3>
            <p>{l.summary}</p>
            <div className="meta">
              <span>⏱ {l.minutes} דק׳ · {l.steps.length} שלבים</span>
              {done.includes(l.slug) ? <span className="done">✓ הושלם</span> : <span style={{ color: l.color }}>←</span>}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
