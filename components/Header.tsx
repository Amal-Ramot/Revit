"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "בית" },
  { href: "/lessons/interface/", label: "שיעורים" },
  { href: "/shortcuts/", label: "קיצורי מקלדת" },
];

export default function Header() {
  const path = usePathname() || "/";
  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="brand">
          <span className="brand-logo">R</span>
          <span>
            REVIT ACADEMY
            <small>המסלול של ניר מימון</small>
          </span>
        </Link>
        <nav className="nav">
          {links.map((l) => {
            const active =
              l.href === "/" ? path === "/" : path.startsWith(l.href.split("/").slice(0, 2).join("/"));
            return (
              <Link key={l.href} href={l.href} className={active ? "active" : ""}>
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
