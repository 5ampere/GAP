export default function SilhouetteLayer() {
  return (
    <div className="hero-silhouettes" aria-hidden>
      <svg className="silhouette-1" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="30" cy="20" r="7" />
        <path d="M30 27c2 18 10 28 25 33" />
        <path d="M42 40l-12 15M45 45l15-3" />
        <path d="M55 60l-15 25M55 60l17 18" />
      </svg>
      <svg className="silhouette-2" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="55" cy="22" r="6" />
        <path d="M52 28c-7 17-14 27-22 37" />
        <path d="M30 65L15 78M30 65l15 13" />
        <path d="M45 40l15-5 8 20" />
      </svg>
      <svg className="silhouette-3" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="40" cy="18" r="6" />
        <path d="M40 24c10 16 15 26 10 41" />
        <path d="M45 32l17-12M42 38l18-4" />
        <path d="M50 65l-12 17M50 65l12 15" />
      </svg>
    </div>
  );
}
