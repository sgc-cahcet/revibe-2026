import { Link } from "react-router-dom";
import SpiderWeb from "../components/navigation/SpiderWeb";
import samosaPNG from "../assets/Photos/samosa.png";

const COLOR = {
  red: "#e63946",
  redDeep: "#b7102a",
  black: "#1a1a1a",
  blackDeep: "#0d0d0d",
  offWhite: "#f5f5f5",
  paper: "#f9f9f9",
};

export default function Canteen() {
  return (
    <>
      <main className="cn-page">
        <section className="cn-hero" aria-labelledby="cn-title">
          <SpiderWeb className="cn-web cn-web-tl" />
          <SpiderWeb className="cn-web cn-web-br" />

          <div className="cn-shell">
            <p className="cn-kicker">
              <span className="cn-kicker-mark" aria-hidden="true" />
              REVIBE '26 · Canteen Special
            </p>

            <div className="cn-samosa" aria-hidden="true">
              <img className="cn-samosa-img" src={samosaPNG} alt="" />
            </div>

            <h1 id="cn-title" className="cn-title">
              <span className="cn-line">You came for a free samosa.</span>
              <span className="cn-line">
                You got{" "}
                <span className="cn-revibe">
                  Revibe '26<span className="cn-tail"> instead. 💀</span>
                </span>
              </span>
            </h1>

            <p className="cn-body">Honestly… not the worst trade deal. 👀</p>

            <p className="cn-strong">
              The vibe starts here. Enter the REVIBE. 🔥
            </p>

            <div className="cn-cta-row">
              {/* <Link to="/events" className="cn-primary-btn">
                Register Now
              </Link> */}
            </div>
          </div>
        </section>
      </main>

      <style>{`
        /* =====================================================
           CANTEEN PAGE - single hero, neo-comic system
           Off-white canvas · Anton / Hanken / JetBrains Mono
           Brusher red accent for "REVIBE"
           ===================================================== */

        .cn-page {
          width: 100%;
          color: ${COLOR.black};
          overflow-x: hidden;
          background: ${COLOR.offWhite};
        }

        .cn-hero {
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

        .cn-shell {
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

        .cn-kicker {
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

        .cn-kicker-mark {
          width: 8px;
          height: 8px;
          background: ${COLOR.red};
          display: inline-block;
        }

        /* ---------- samosa ---------- */

        .cn-samosa {
          width: 170px;
          margin: 0 auto 1.2rem;
          transform: rotate(-6deg);
          transition: transform 0.2s ease;
          filter: drop-shadow(0 8px 14px rgba(26, 26, 26, 0.22));
        }

        .cn-samosa:hover {
          transform: rotate(-2deg) scale(1.05);
        }

        .cn-samosa-img {
          width: 100%;
          height: auto;
          display: block;
        }

        /* ---------- headline ---------- */

        .cn-title {
          margin: 0;
          font-family: 'Anton', sans-serif;
          font-weight: 400;
          font-size: clamp(1.8rem, 4.2vw, 3.2rem);
          line-height: 1.12;
          letter-spacing: 0.03em;
          color: ${COLOR.blackDeep};
          text-transform: uppercase;
          text-wrap: balance;
        }

        .cn-line {
          display: block;
        }

        .cn-revibe {
          font-family: 'Brusher', cursive;
          font-size: clamp(2.8rem, 7vw, 5rem);
          line-height: 0.9;
          letter-spacing: 0.03em;
          color: ${COLOR.red};
          text-transform: none;
          display: inline-block;
          vertical-align: baseline;
          padding: 0 0.06em;
        }

        .cn-tail {
          font-family: 'Anton', sans-serif;
          font-size: 0.6em;
          color: ${COLOR.blackDeep};
          text-transform: uppercase;
        }

        /* ---------- body copy ---------- */

        .cn-body {
          max-width: 640px;
          margin: 1.6rem auto 0;
          font-family: 'Hanken Grotesk', sans-serif;
          font-weight: 400;
          font-size: 1.1rem;
          line-height: 1.65;
          color: ${COLOR.black};
        }

        .cn-strong {
          margin: 1.1rem auto 0;
          max-width: 720px;
          font-family: 'Anton', sans-serif;
          font-weight: 400;
          font-size: clamp(1.35rem, 3.2vw, 2.1rem);
          line-height: 1.2;
          letter-spacing: 0.04em;
          color: ${COLOR.blackDeep};
          text-transform: uppercase;
        }

        /* ---------- CTA ---------- */

        .cn-cta-row {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 1.1rem;
          margin-top: 2.5rem;
        }

        .cn-primary-btn {
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

        .cn-primary-btn::after {
          content: "→";
          font-family: 'Hanken Grotesk', sans-serif;
          font-size: 1rem;
          transition: transform 0.2s ease;
        }

        .cn-primary-btn:hover,
        .cn-primary-btn:focus-visible {
          transform: translateY(-3px);
          background: #0d0d0d;
          color: #ffffff;
          box-shadow: 0 14px 30px rgba(0, 0, 0, 0.35);
        }

        .cn-primary-btn:hover::after,
        .cn-primary-btn:focus-visible::after {
          transform: translateX(4px);
        }

        /* ---------- corner webs ---------- */

        .cn-web {
          position: absolute;
          pointer-events: none;
          z-index: 0;
        }

        .cn-web-tl {
          top: -60px;
          left: 16px;
          width: 300px;
          height: 300px;
          opacity: 0.6;
        }

        .cn-web-br {
          bottom: 0;
          right: 0;
          width: 200px;
          height: 200px;
          transform: rotate(180deg);
          opacity: 0.45;
        }

        /* ---------- responsive ---------- */

        @media (min-width: 1024px) {
          .cn-shell {
            padding-left: 64px;
            padding-right: 64px;
          }
        }

        @media (max-width: 768px) {
          .cn-hero {
            min-height: calc(100vh - 140px);
            min-height: calc(100dvh - 140px);
            padding: 4rem 0 3.5rem;
          }

          .cn-title {
            font-size: clamp(1.3rem, 5.6vw, 1.9rem);
          }

          .cn-revibe {
            display: block;
            font-size: clamp(3.4rem, 16vw, 4.6rem);
            line-height: 1.05;
            margin: 0.4rem 0 0.35rem;
          }

          .cn-tail {
            display: block;
            font-size: clamp(1.3rem, 5.6vw, 1.9rem);
            line-height: 1.2;
          }

          .cn-body {
            font-size: 1rem;
            margin-top: 1.4rem;
          }

          .cn-cta-row {
            margin-top: 2rem;
          }

          .cn-web-tl {
            top: 0;
            left: 0;
            width: 110px;
            height: 110px;
            opacity: 0.45;
          }

          .cn-web-br {
            width: 90px;
            height: 90px;
            opacity: 0.35;
          }
        }

        @media (max-width: 430px) {
          .cn-hero {
            min-height: calc(100vh - 120px);
            min-height: calc(100dvh - 120px);
            padding: 3rem 0 2.75rem;
          }

          .cn-kicker {
            font-size: 10px;
            letter-spacing: 0.14em;
            margin-bottom: 1.1rem;
          }

          .cn-samosa {
            width: 108px;
            margin-bottom: 1.1rem;
          }

          .cn-title {
            font-size: clamp(1.2rem, 6vw, 1.55rem);
            line-height: 1.18;
          }

          .cn-revibe {
            font-size: clamp(3.2rem, 19vw, 4rem);
          }

          .cn-body {
            font-size: 0.95rem;
          }

          .cn-cta-row {
            margin-top: 1.75rem;
          }

          .cn-primary-btn {
            width: 100%;
            max-width: 340px;
            min-height: 46px;
            padding: 0.75rem 1.3rem;
            font-size: 0.98rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .cn-primary-btn,
          .cn-primary-btn::after,
          .cn-samosa {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
