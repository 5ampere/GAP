"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { store } from "@/lib/store";
import { useI18n } from "@/lib/i18n";

export default function AppEntry() {
  const router = useRouter();
  const { t } = useI18n();

  useEffect(() => {
    const plan = store.get("gap.plan", null);
    router.replace(plan ? "/app/dashboard" : "/app/onboarding");
  }, [router]);

  return (
    <main className="section center" style={{ minHeight: "55vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div>
        <h2 className="display-title">GAP</h2>
        <p className="body text-secondary mt-2">{t("ob.step6.sub")}</p>
      </div>
    </main>
  );
}
