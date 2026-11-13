"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ViewerLazy from "./ViewerLazy";
import DiagramView from "./Diagrams";
import { getLesson, lessons } from "@/lib/lessons";
import { useProgress } from "@/lib/progress";
import type { VisualStyle } from "./three/House";

const STYLES: { id: VisualStyle; label: string }[] = [
  { id: "wireframe", label: "Wireframe" },
  { id: "hidden", label: "Hidden" },
  { id: "shaded", label: "Shaded" },
  { id: "realistic", label: "Realistic" },
];

export default function LessonView({ slug }: { slug: string }) {
  const lesson = getLesson(slug)!;
  const idx = lessons.indexOf(lesson);
  const prev = lessons[idx - 1];
  const next = lessons[idx + 1];
  const { done, toggle } = useProgress();

  const [style, setStyle] = useState<VisualStyle>(lesson.stage >= 9 ? "realistic" : "shaded");
  const [section, setSection] = useState(lesson.slug === "views");
  const [datums, setDatums] = useState(lesson.stage >= 1 && lesson.stage <= 4);
  const [spin, setSpin] = useState(true);
  const [step, setStep] = useState(0);
  const [seen, setSeen] = useState<number[]>([0]);
  const [pick, setPick] = useState<number | null>(null);

  useEffect(() => {
    setSeen((s) => (s.includes(step) ? s : [...s, step]));
  }, [step]);

  const isDone = done.includes(lesson.slug);
  const c = { ["--c" as string]: lesson.color };

  return (
    <div className="container" style={c}>
      <div className="lesson-layout">
        {/* content column (right side in RTL) */}
        <div>
          <div className="lesson-head">
            <div className="crumb">
              <Link href="/">בית</Link> / <span>שיעור {idx + 1} מתוך {lessons.length}</span>
            </div>
            <h1>{lesson.title}</h1>
            <div className="en">{lesson.en} · {lesson.minutes} min</div>
            <div className="rail" style={{ marginTop: 16 }}>
              {lessons.map((l, i) => (
                <Link
                  key={l.slug}
                  href={`/lessons/${l.slug}/`}
                  title={l.title}
                  className={`${l.slug === slug ? "cur" : ""} ${done.includes(l.slug) ? "ok" : ""}`}
                >
                  {i + 1}
                </Link>
              ))}
            </div>
            <p className="summary">{lesson.summary}</p>
            <div className="goal">
              <span>🎯</span>
              <span>{lesson.goal}</span>
            </div>
          </div>

          {lesson.diagram && (
            <div className="panel">
              <h2>
                מבט על התוכנה <span className="tag">Diagram</span>
              </h2>
              <DiagramView type={lesson.diagram} />
            </div>
          )}

          <div className="panel">
            <h2>
              שלב אחרי שלב{" "}
              <span className="tag">
                {seen.length}/{lesson.steps.length}
              </span>
            </h2>
            <div className="steps">
              {lesson.steps.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  className={`step ${step === i ? "on" : ""} ${seen.includes(i) ? "seen" : ""}`}
                  onClick={() => setStep(i)}
                  aria-expanded={step === i}
                >
                  <span className="n">{seen.includes(i) && step !== i ? "✓" : i + 1}</span>
                  <span>
                    <h3>{s.title}</h3>
                    <span className="body">
                      <div>
                        {s.body}
                        {s.keys && (
                          <span className="keys">
                            {s.keys.map((k, j) => (
                              <span key={j} className="kbd">{k}</span>
                            ))}
                          </span>
                        )}
                      </div>
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <div className="step-nav">
              <button className="btn btn-ghost" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))} style={{ padding: "10px 18px" }}>
                → הקודם
              </button>
              <button
                className="btn btn-primary"
                style={{ padding: "10px 18px" }}
                onClick={() => setStep((s) => Math.min(lesson.steps.length - 1, s + 1))}
                disabled={step === lesson.steps.length - 1}
              >
                השלב הבא ←
              </button>
            </div>
          </div>

          <div className="panel">
            <h2>טיפים מהשטח <span className="tag">Pro Tips</span></h2>
            <ul className="tips">
              {lesson.tips.map((t, i) => (
                <li key={i}>
                  <span>💡</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel">
            <h2>קיצורי מקלדת <span className="tag">Shortcuts</span></h2>
            <div className="sc-grid">
              {lesson.shortcuts.map((s) => (
                <div key={s.key} className="sc">
                  <span className="kbd">{s.key}</span>
                  <span>{s.action}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <h2>בוחן קצר <span className="tag">Quiz</span></h2>
            <p className="quiz-q">{lesson.quiz.q}</p>
            <div className="quiz-opts">
              {lesson.quiz.options.map((o, i) => {
                const cls = pick === null ? "" : i === lesson.quiz.answer ? "right" : i === pick ? "wrong" : "";
                return (
                  <button
                    key={i}
                    className={`quiz-opt ${cls}`}
                    disabled={pick !== null}
                    onClick={() => {
                      setPick(i);
                      if (i === lesson.quiz.answer) toggle(lesson.slug, true);
                    }}
                  >
                    {o}
                  </button>
                );
              })}
            </div>
            {pick !== null && (
              <div className="quiz-explain">
                {pick === lesson.quiz.answer ? "✓ נכון מאוד! " : "✗ לא בדיוק. "}
                {lesson.quiz.explain}
                {pick !== lesson.quiz.answer && (
                  <button className="btn btn-ghost" style={{ padding: "6px 12px", marginInlineStart: 10, fontSize: 13 }} onClick={() => setPick(null)}>
                    לנסות שוב
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="lesson-foot">
            <button className={`btn ${isDone ? "btn-ghost" : "btn-primary"}`} onClick={() => toggle(lesson.slug)}>
              {isDone ? "✓ השיעור הושלם" : "סמן כהושלם"}
            </button>
          </div>
          <div className="lesson-foot">
            {prev ? (
              <Link className="next-card" href={`/lessons/${prev.slug}/`}>
                <small>→ השיעור הקודם</small>
                <b>{prev.title}</b>
              </Link>
            ) : <span />}
            {next ? (
              <Link className="next-card" href={`/lessons/${next.slug}/`} style={{ textAlign: "left" }}>
                <small>השיעור הבא ←</small>
                <b>{next.title}</b>
              </Link>
            ) : (
              <Link className="next-card" href="/" style={{ textAlign: "left" }}>
                <small>סיימת את המסלול 🎉</small>
                <b>חזרה לדף הבית</b>
              </Link>
            )}
          </div>
        </div>

        {/* 3D viewer column */}
        <div className="viewer-wrap">
          <div className="viewer">
            <div className="viewer-toolbar">
              <div className="seg" role="group" aria-label="Visual style">
                {STYLES.map((s) => (
                  <button key={s.id} className={style === s.id ? "on" : ""} onClick={() => setStyle(s.id)}>
                    {s.label}
                  </button>
                ))}
              </div>
              <div className="seg">
                <button className={section ? "on" : ""} onClick={() => setSection((v) => !v)} title="Section Box">
                  ✂ חתך
                </button>
                <button className={datums ? "on" : ""} onClick={() => setDatums((v) => !v)} title="Levels & Grids">
                  ⌗ מפלסים
                </button>
                <button className={spin ? "on" : ""} onClick={() => setSpin((v) => !v)} title="Auto rotate">
                  ⟳
                </button>
              </div>
            </div>
            <ViewerLazy stage={lesson.stage} style={style} focus datums={datums} section={section} autoRotate={spin} />
            <div className="viewer-caption">
              <span className="chip">
                <span style={{ color: lesson.color }}>●</span> מודגש: {lesson.en}
              </span>
              <span className="chip">גרירה = סיבוב · גלגלת = זום</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
