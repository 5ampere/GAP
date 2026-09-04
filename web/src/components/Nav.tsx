"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { store } from "@/lib/store";

export default function Nav() {
  const pathname = usePathname();
  const { t, lang, setLang } = useI18n();

  useEffect(() => {
    const nav = document.getElementById("nav");
    if (!nav) return;
    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleTheme = () => {
    const cur = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", cur);
    store.set("gap.theme", cur);
  };

  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="nav" id="nav">
      <div className="nav-inner container">
        <Link className="nav-logo" href="/">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" strokeDasharray="42 56" transform="rotate(-90 12 12)" />
            <circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none" />
          </svg>
          <span>GAP</span>
        </Link>
        <nav className="nav-links" aria-label="primary">
          <Link href="/" className={active("/") ? "is-active" : ""}>
            {t("nav.home")}
          </Link>
          <Link href="/app/onboarding" className={active("/app/onboarding") ? "is-active" : ""}>
            {t("nav.start")}
          </Link>
          <Link href="/docs" className={active("/docs") ? "is-active" : ""}>
            {t("nav.docs")}
          </Link>
        </nav>
        <div className="nav-actions">
          <button className="icon-btn" type="button" onClick={() => setLang(lang === "zh" ? "en" : "zh")}>
            {lang === "zh" ? "EN" : "中"}
          </button>
          <button className="icon-btn" type="button" onClick={toggleTheme}>
            ◐
          </button>
        </div>
      </div>
    </header>
  );
}
