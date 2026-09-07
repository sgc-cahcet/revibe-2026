import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import SpiderWeb from "../components/navigation/SpiderWeb";

const VALID_ROUTES = [
  "/",
  "/about",
  "/events",
  "/team",
  "/location",
  "/login",
  "/coordinator",
  "/register",
];

function getSuggestion(pathname) {
  const lower = pathname.toLowerCase().replace(/[^a-z0-9]/g, "");
  const map = {
    home: "/",
    about: "/about",
    events: "/events",
    event: "/events",
    team: "/team",
    members: "/team",
    sponsors: "/team",
    location: "/location",
    venue: "/location",
    login: "/login",
    register: "/register",
    coordinator: "/coordinator",
  };
  return map[lower] || null;
}

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();
  const canvasRef = useRef(null);
  const [suggestion] = useState(() => getSuggestion(location.pathname));
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const strands = [];
    const STRAND_COUNT = 6;
    for (let i = 0; i < STRAND_COUNT; i++) {
      const angle = (Math.PI * 2 * i) / STRAND_COUNT - Math.PI / 2;
      strands.push({ angle, rings: 8 });
    }

    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.min(w, h) * 0.48;
      const wave = Math.sin(t * 0.02) * 4;

      ctx.strokeStyle = "rgba(220, 0, 0, 0.12)";
      ctx.lineWidth = 1;

      for (const s of strands) {
        const ex = cx + Math.cos(s.angle) * maxR;
        const ey = cy + Math.sin(s.angle) * maxR;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      }

      for (let r = 1; r <= 8; r++) {
        const radius = (maxR / 8) * r + wave * (r / 8);
        ctx.beginPath();
        for (let i = 0; i <= STRAND_COUNT; i++) {
          const angle =
            (Math.PI * 2 * (i % STRAND_COUNT)) / STRAND_COUNT - Math.PI / 2;
          const x = cx + Math.cos(angle) * radius;
          const y = cy + Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(cx, cy, 5 + Math.sin(t * 0.05) * 2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(220, 0, 0, 0.3)";
      ctx.fill();

      t++;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const handleQuickNav = (e) => {
    e.preventDefault();
    if (typed.trim()) {
      const lower = typed.toLowerCase().replace(/[^a-z0-9]/g, "");
      const match = VALID_ROUTES.find((r) =>
        r.replace("/", "").startsWith(lower)
      );
      if (match) navigate(match);
      else navigate("/");
    } else {
      navigate("/");
    }
  };

  return (
    <>
<main className="nf-page">
          <SpiderWeb className="nf-web nf-web--tl" />
          <SpiderWeb className="nf-web nf-web--tr" />
          <SpiderWeb className="nf-web nf-web--bl" />
          <SpiderWeb className="nf-web nf-web--br" />

          <canvas ref={canvasRef} className="nf-canvas" aria-hidden="true" />

          <div className="nf-card">
            <p className="nf-kicker">REVIBE '26 · ERROR</p>

            <h1 className="nf-code">
              4<span className="nf-code-zero">0</span>4
            </h1>

            <p className="nf-headline">Tangled in the wrong web.</p>

            <p className="nf-body">
              The strand you followed leads nowhere. The page you're looking for
              has been cut from the web — or maybe it was never spun at all.
            </p>

            {suggestion && (
              <p className="nf-suggestion">
                Did you mean{" "}
                <Link to={suggestion} className="nf-suggestion-link">
                  {suggestion === "/" ? "Home" : suggestion.replace("/", "")}
                </Link>
                ?
              </p>
            )}

          {suggestion && (
            <p className="nf-suggestion">
              Did you mean{" "}
              <Link to={suggestion} className="nf-suggestion-link">
                {suggestion === "/" ? "Home" : suggestion.replace("/", "")}
              </Link>
              ?
            </p>
          )}

          <form className="nf-search" onSubmit={handleQuickNav}>
            <input
              className="nf-input"
              type="text"
              placeholder="Type a page name to jump…"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              aria-label="Quick navigation search"
              list="nf-routes"
            />
            <datalist id="nf-routes">
              {VALID_ROUTES.filter((r) => r !== "/coordinator").map((r) => (
                <option key={r} value={r.replace("/", "") || "home"} />
              ))}
            </datalist>
            <button type="submit" className="nf-go">
              Go
            </button>
          </form>

          <div className="nf-links">
            <Link to="/" className="nf-btn nf-btn--primary">
              Back to Home
            </Link>
            <Link to="/events" className="nf-btn nf-btn--ghost">
              Browse Events
            </Link>
          </div>

          <p className="nf-path">
            Lost at: <code>{location.pathname}</code>
          </p>
        </div>
      </main>

      <style>{`
        .nf-page {
          position: relative;
          width: 100%;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          color: #e0e0e0;
          overflow: hidden;
          font-family: 'Hanken Grotesk', sans-serif;
          padding: 48px 16px;
          box-sizing: border-box;
        }

        .nf-page .nf-card {
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
        }

        .nf-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
          opacity: 0.7;
        }

        .nf-web {
          position: absolute;
          pointer-events: none;
          z-index: 0;
          opacity: 0.25;
        }

        .nf-web--tl { top: 0; left: 0; width: 160px; height: 160px; }
        .nf-web--tr { top: 0; right: 0; width: 140px; height: 140px; transform: scaleX(-1); }
        .nf-web--bl { bottom: 0; left: 0; width: 140px; height: 140px; transform: scaleY(-1); }
        .nf-web--br { bottom: 0; right: 0; width: 160px; height: 160px; transform: rotate(180deg); }

        .nf-card {
          position: relative;
          z-index: 1;
          text-align: center;
          max-width: 640px;
          width: 100%;
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          border-radius: 20px;
          padding: 40px 32px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
          margin: 0 auto;
        }

        .nf-kicker {
          margin: 0 0 16px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #ff006e;
        }

        .nf-code {
          margin: 0;
          font-family: 'Anton', sans-serif;
          font-weight: 400;
          font-size: clamp(72px, 18vw, 160px);
          line-height: 0.9;
          letter-spacing: 0.02em;
          color: #e0e0e0;
          text-transform: uppercase;
          text-shadow: 0 0 30px rgba(255, 0, 110, 0.4);
        }

        .nf-code-zero {
          display: inline-block;
          color: #dc0000;
          animation: nf-pulse 2s ease-in-out infinite;
        }

        @keyframes nf-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.8; }
        }

        .nf-headline {
          margin: 12px 0 16px;
          font-family: 'Anton', sans-serif;
          font-size: clamp(20px, 4vw, 32px);
          letter-spacing: 0.04em;
          color: #ff006e;
          text-transform: uppercase;
        }

        .nf-body {
          margin: 0 auto 20px;
          max-width: 480px;
          font-size: 16px;
          line-height: 26px;
          color: #c0c0c0;
        }

        .nf-suggestion {
          margin: 0 0 24px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          color: #888888;
        }

        .nf-suggestion-link {
          color: #ff006e;
          font-weight: 700;
          text-decoration: none;
          border-bottom: 1px dashed rgba(255, 0, 110, 0.4);
        }

        .nf-suggestion-link:hover {
          border-bottom-style: solid;
          color: #ff3380;
        }

        .nf-search {
          display: flex;
          gap: 0;
          max-width: 360px;
          margin: 0 auto 28px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 16px;
          padding: 4px;
        }

        .nf-input {
          flex: 1;
          min-width: 0;
          padding: 12px 16px;
          border: none;
          border-radius: 12px;
          background: #ffffff;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          color: #1a1a1a;
          outline: none;
        }

        .nf-input:focus {
          border: 2px solid #ff006e;
        }

        .nf-go {
          padding: 12px 22px;
          border: 2px solid #ff006e;
          border-radius: 12px;
          background: #ff006e;
          color: #ffffff;
          font-family: 'Anton', sans-serif;
          font-size: 14px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          min-width: 80px;
        }

        .nf-go:hover {
          transform: translate(-2px, -2px);
          box-shadow: 4px 4px 0 #1a1a1a;
        }

        .nf-links {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
          margin-bottom: 32px;
        }

        .nf-btn {
          display: inline-flex;
          align-items: center;
          padding: 12px 26px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 10px;
          font-family: 'Anton', sans-serif;
          font-size: 15px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          text-decoration: none;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          background: transparent;
          color: #e0e0e0;
        }

        .nf-btn--primary {
          background: #ff006e;
          color: #ffffff;
          border-color: #ff006e;
          box-shadow: 4px 4px 0 #1a1a1a;
        }

        .nf-btn--primary:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0 #1a1a1a;
        }

        .nf-btn--ghost {
          background: transparent;
          color: #e0e0e0;
        }

        .nf-btn--ghost:hover {
          background: rgba(255, 0, 110, 0.1);
          border-color: #ff006e;
          color: #ff006e;
        }

        .nf-path {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #666;
          margin: 0;
        }

        .nf-path code {
          padding: 2px 8px;
          background: rgba(26, 26, 26, 0.06);
          border-radius: 4px;
          color: #b7102a;
        }

        @media (max-width: 560px) {
          .nf-web--tr,
          .nf-web--bl {
            display: none;
          }

          .nf-search {
            flex-direction: column;
            gap: 8px;
          }

          .nf-input {
            border-right: 2px solid #1a1a1a;
            border-radius: 10px;
          }

          .nf-go {
            border-radius: 10px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .nf-code-zero {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}
