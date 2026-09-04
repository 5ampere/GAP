"use client";

import { useI18n } from "@/lib/i18n";

export default function DocsPage() {
  const { L } = useI18n();
  return (
    <main className="section center" style={{ minHeight: "55vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div>
        <h1 className="display-title">{L("了解 GAP", "About GAP")}</h1>
        <p className="body-lg text-secondary mt-4" style={{ maxWidth: 460 }}>
          {L(
            "知识库正在建设中——这里将陆续上线：GAP 是什么、18 能力地图、计划如何生成、安全须知等。",
            "The knowledge base is under construction — coming soon: what GAP is, the 18-ability map, how plans are generated, safety notes and more."
          )}
        </p>
      </div>
    </main>
  );
}
