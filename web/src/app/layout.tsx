import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./tokens.css";
import "./base.css";
import "./components.css";
import "./landing.css";
import "./app.css";
import Providers from "@/components/Providers";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "GAP — General Athletic Preparation",
  description: "为多运动爱好者建设通用运动能力底座。",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('gap.theme')||'light';document.documentElement.setAttribute('data-theme',t);}catch(e){}",
          }}
        />
        <Providers>
          <Nav />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
