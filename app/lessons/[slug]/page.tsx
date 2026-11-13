import { notFound } from "next/navigation";
import type { Metadata } from "next";
import LessonView from "@/components/LessonView";
import { getLesson, lessons } from "@/lib/lessons";

export function generateStaticParams() {
  return lessons.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const l = getLesson(slug);
  return { title: l ? `${l.title} · Revit Academy` : "Revit Academy" };
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getLesson(slug)) notFound();
  return <LessonView key={slug} slug={slug} />;
}
