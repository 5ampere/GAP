"use client";

import { useI18n } from "@/lib/i18n";

export default function TrainingPage() {
  const { L } = useI18n();
  return (
    <main className="section center" style={{ minHeight: "55vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div>
        <h1 className="display-title">{L("我的能力", "My Abilities")}</h1>
        <p className="body-lg text-secondary mt-4" style={{ maxWidth: 460 }}>
          {L("提交一次能力测试后，这里将展示你的能力变化。", "After submitting a capacity test, your ability changes will appear here.")}
        </p>
      </div>
    </main>
  );
}
