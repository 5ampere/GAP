import type { NextConfig } from "next";

// GAP 为纯客户端静态站（数据在 localStorage，无服务端/API/SSR），故构建为纯静态导出：
//   - output: "export"：所有路由预渲染为静态 HTML，产物在 `out/`；
//   - trailingSlash: true：每路由产出 <dir>/index.html，深链（如 /app/plan/）在任意静态主机可直接访问。
// 部署目标：EdgeOne Pages（免费、默认域名免备案）。构建参数：根目录 `web` · 构建命令 `npm run build` · 输出目录 `out`。
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
