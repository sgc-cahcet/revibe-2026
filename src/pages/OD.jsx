import { Link } from "react-router-dom";
import SpiderWeb from "../components/navigation/SpiderWeb";

const COLOR = {
  red: "#e63946",
  redDeep: "#b7102a",
  black: "#1a1a1a",
  blackDeep: "#0d0d0d",
  offWhite: "#f5f5f5",
  paper: "#f9f9f9",
};

export default function OD() {
  return (
    <>
      <main className="od-page">
        <section className="od-hero" aria-labelledby="od-title">
          <SpiderWeb className="od-web od-web-tl" />
          <SpiderWeb className="od-web od-web-br" />

          <div className="od-shell">
            <p className="od-kicker">
              <span className="od-kicker-mark" aria-hidden="true" />
              REVIBE '26 · OD Pass
            </p>

            <h1 id="od-title" className="od-title">
              <span className="od-line">
                Just register for{" "}
                <span className="od-revibe">
                  Revibe<span className="od-comma">,</span>
                </span>
              </span>
              <span className="od-line">get your OD, and enjoy</span>
              <span className="od-line">the attendance in easy way.</span>
            </h1>

            <div className="od-cta-row">
              {/* <Link to="/events" className="od-primary-btn">
                Register Now
              </Link> */}
            </div>
          </div>
        </section>
      </main>

      <style>{`
        /* =====================================================
           OD PAGE - single hero, neo-comic system
           Off-white canvas · Anton / Hanken / JetBrains Mono
           Brusher red accent for "Revibe"
           ===================================================== */

        .od-page {
          width: 100%;
          color: ${COLOR.black};
          overflow-x: hidden;
          background: ${COLOR.offWhite};
        }

        .od-hero {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 160px);
          padding: 6rem 0 5rem;
          background:
            repeating-linear-gradient(45deg, rgba(26,26,26,0.04) 0 1px, transparent 1px 28px),
            repeating-linear-gradient(-45deg, rgba(26,26,26,0.04) 0 1px, transparent 1px 28px),
            ${COLOR.offWhite};
          border-bottom: 2px solid ${COLOR.black};
          overflow: hidden;
        }

        .od-shell {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 980px;
          margin: 0 auto;
          padding-left: 16px;
          padding-right: 16px;
          text-align: center;
          box-sizing: border-box;
        }

        /* ---------- kicker ---------- */

        .od-kicker {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          margin: 0 0 1.4rem;
          padding: 0.4rem 0.85rem;
          background: ${COLOR.black};
          color: #ffffff;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .od-kicker-mark {
          width: 8px;
          height: 8px;
          background: ${COLOR.red};
          display: inline-block;
        }

        /* ---------- headline ---------- */

        .od-title {
          margin: 0;
          font-family: 'Anton', sans-serif;
          font-weight: 400;
          font-size: clamp(2.1rem, 5.5vw, 4.2rem);
          line-height: 1.12;
          letter-spacing: 0.03em;
          color: ${COLOR.blackDeep};
          text-transform: uppercase;
          text-wrap: balance;
        }

        .od-line {
          display: block;
        }

        .od-revibe {
          font-family: 'Brusher', cursive;
          font-size: clamp(2.9rem, 8vw, 6rem);
          line-height: 0.9;
          letter-spacing: 0.03em;
          color: ${COLOR.red};
          text-transform: none;
          display: inline-block;
          vertical-align: baseline;
          padding: 0 0.06em;
        }

        .od-comma {
          font-family: 'Anton', sans-serif;
          font-size: 0.6em;
          color: ${COLOR.blackDeep};
        }

        /* ---------- CTA ---------- */

        .od-cta-row {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 1.1rem;
          margin-top: 2.5rem;
        }

        .od-primary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          min-height: 50px;
          padding: 0.95rem 1.9rem;
          border: 2px solid #0d0d0d;
          border-radius: 999px;
          font-family: 'Anton', sans-serif;
          font-size: 1.1rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          text-decoration: none;
          background: #dc0000;
          color: #ffffff;
          box-shadow: 0 8px 22px rgba(220, 0, 0, 0.35);
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }

        .od-primary-btn::after {
          content: "→";
          font-family: 'Hanken Grotesk', sans-serif;
          font-size: 1rem;
          transition: transform 0.2s ease;
        }

        .od-primary-btn:hover,
        .od-primary-btn:focus-visible {
          transform: translateY(-3px);
          background: #0d0d0d;
          color: #ffffff;
          box-shadow: 0 14px 30px rgba(0, 0, 0, 0.35);
        }

        .od-primary-btn:hover::after,
        .od-primary-btn:focus-visible::after {
          transform: translateX(4px);
        }

        /* ---------- corner webs ---------- */

        .od-web {
          position: absolute;
          pointer-events: none;
          z-index: 0;
        }

        .od-web-tl {
          top: -60px;
          left: 16px;
          width: 300px;
          height: 300px;
          opacity: 0.6;
        }

        .od-web-br {
          bottom: 0;
          right: 0;
          width: 200px;
          height: 200px;
          transform: rotate(180deg);
          opacity: 0.45;
        }

        /* ---------- responsive ---------- */

        @media (min-width: 1024px) {
          .od-shell {
            padding-left: 64px;
            padding-right: 64px;
          }
        }

        @media (max-width: 768px) {
          .od-hero {
            min-height: calc(100vh - 140px);
            min-height: calc(100dvh - 140px);
            padding: 4rem 0 3.5rem;
          }

          .od-title {
            font-size: clamp(1.35rem, 5.8vw, 2rem);
          }

          .od-revibe {
            display: block;
            font-size: clamp(3.4rem, 16vw, 4.6rem);
            line-height: 1.05;
            margin: 0.4rem 0 0.5rem;
          }

          .od-cta-row {
            margin-top: 2rem;
          }

          .od-web-tl {
            top: 0;
            left: 0;
            width: 110px;
            height: 110px;
            opacity: 0.45;
          }

          .od-web-br {
            width: 90px;
            height: 90px;
            opacity: 0.35;
          }
        }

        @media (max-width: 430px) {
          .od-hero {
            min-height: calc(100vh - 120px);
            min-height: calc(100dvh - 120px);
            padding: 3rem 0 2.75rem;
          }

          .od-kicker {
            font-size: 10px;
            letter-spacing: 0.14em;
            margin-bottom: 1.1rem;
          }

          .od-title {
            font-size: clamp(1.25rem, 6.4vw, 1.6rem);
            line-height: 1.18;
          }

          .od-revibe {
            font-size: clamp(3.2rem, 19vw, 4rem);
          }

          .od-cta-row {
            margin-top: 1.75rem;
          }

          .od-primary-btn {
            width: 100%;
            max-width: 340px;
            min-height: 46px;
            padding: 0.75rem 1.3rem;
            font-size: 0.98rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .od-primary-btn,
          .od-primary-btn::after {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
