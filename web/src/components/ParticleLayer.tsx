// 确定性粒子（无随机数，避免 SSR 水合不一致）
export default function ParticleLayer() {
  const particles = Array.from({ length: 26 }, (_, i) => {
    const size = (2 + ((i * 7) % 5)).toFixed(1);
    const left = ((i * 37 + 11) % 100).toFixed(1);
    const top = ((i * 53 + 7) % 100).toFixed(1);
    const delay = ((i * 0.7) % 6).toFixed(1);
    const dur = (6 + ((i * 3) % 6)).toFixed(1);
    const accent = i % 4 === 0 ? " particle--accent" : "";
    return { size, left, top, delay, dur, accent };
  });

  return (
    <div className="hero-particles" aria-hidden>
      {particles.map((p, i) => (
        <span
          key={i}
          className={"particle" + p.accent}
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            top: `${p.top}%`,
            animation: `drift ${p.dur}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
