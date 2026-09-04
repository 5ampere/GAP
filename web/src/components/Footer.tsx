"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-col">
            <h4>{t("footer.product")}</h4>
            <Link href="/">{t("nav.home")}</Link>
            <Link href="/app/onboarding">{t("nav.start")}</Link>
          </div>
          <div className="footer-col">
            <h4>{t("footer.knowledge")}</h4>
            <Link href="/docs">{t("nav.docs")}</Link>
          </div>
          <div className="footer-col">
            <h4>{t("footer.legal")}</h4>
            <a href="#" onClick={(e) => e.preventDefault()}>
              {t("footer.disclaimerLink")}
            </a>
          </div>
          <div className="footer-col">
            <h4>GAP</h4>
            <p className="micro">{t("footer.tagline")}</p>
          </div>
        </div>
        <div className="footer-bottom">{t("footer.disclaimer")}</div>
      </div>
    </footer>
  );
}
