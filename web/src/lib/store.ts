// localStorage 封装（SSR 安全，客户端专用）。后续可替换为真实 API service 层。
function isClient(): boolean {
  return typeof window !== "undefined";
}

export const store = {
  get<T>(key: string, def: T): T {
    if (!isClient()) return def;
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? def : (JSON.parse(raw) as T);
    } catch {
      return def;
    }
  },
  set<T>(key: string, val: T): void {
    if (!isClient()) return;
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {
      /* ignore */
    }
  },
  remove(key: string): void {
    if (!isClient()) return;
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};
