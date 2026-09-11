import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SpiderWeb from "../components/navigation/SpiderWeb";

const COUNTDOWN_TARGET = new Date("2026-09-12T09:00:00").getTime();

const COLOR = {
  red: "#e63946",
  redDeep: "#b7102a",
  black: "#1a1a1a",
  blackDeep: "#0d0d0d",
  offWhite: "#f5f5f5",
  paper: "#f9f9f9",
};

function useCountdown(target) {
  const getRemaining = () => {
    const diff = Math.max(0, target - Date.now());
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return { diff, days, hours, minutes, seconds };
  };

  const [remaining, setRemaining] = useState(getRemaining);

  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return remaining;
}

function TimerUnit({ value, label }) {
  return (
    <div className="timer-unit">
      <span className="timer-value">
        {String(value).padStart(2, "0")}
      </span>
      <span className="timer-label">{label}</span>
    </div>
  );
}

export default function Home() {
  const { diff, days, hours, minutes, seconds } = useCountdown(COUNTDOWN_TARGET);
  const ended = diff <= 0;

  return (
    <>
      <main className="theme-page home-page">
        <section className="page-hero home-hero home-grid-bg" aria-labelledby="hero-title">
          <SpiderWeb className="corner-web hero-web-tl" />
          <SpiderWeb className="corner-web hero-web-br" />
          <div className="page-shell">
            <div className="hero-copy">
              <h1 id="hero-title" className="display-title">
                Revibe <span className="display-year">'26</span>
              </h1>

              <p className="hero-subtitle">National Level Symposium</p>

              <p className="hero-description">
                A student-driven national symposium that brings together
                creativity, technology and participation under one
                web-powered experience.
              </p>

              <div className="hero-meta" aria-label="REVIBE '26 event overview">
                <span className="meta-chip">13 Events</span>
                <span className="meta-chip meta-chip--red">6 Technical</span>
                <span className="meta-chip">7 Non-Technical</span>
              </div>

              <div className="countdown-block" aria-label="Time until REVIBE '26 begins">
                <SpiderWeb className="corner-web timer-web-tr" />
                {ended ? (
                  <p className="countdown-ended">The web has awakened.</p>
                ) : (
                  <>
                    <p className="countdown-heading">
                      Symposium begins in
                    </p>
                    <div className="timer-row">
                      <TimerUnit value={days} label="Days" />
                      <span className="timer-sep" aria-hidden="true">:</span>
                      <TimerUnit value={hours} label="Hours" />
                      <span className="timer-sep" aria-hidden="true">:</span>
                      <TimerUnit value={minutes} label="Mins" />
                      <span className="timer-sep" aria-hidden="true">:</span>
                      <TimerUnit value={seconds} label="Secs" />
                    </div>
                    <p className="countdown-target">
                      12 September 2026 · 9:00 AM
                    </p>
                  </>
                )}
              </div>

              <div className="announcement-block">
                <div className="announcement-marquee">
                  <span className="announcement-marquee-text">
                    Online Registrations are closed&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;Online Registrations are closed&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
                  </span>
                </div>
                <p className="announcement-subtext">
                  On Spot Registrations will be opened tomorrow on 9:00 AM
                </p>
              </div>

              <div className="cta-row">
                <Link to="/events" className="primary-btn">
                  Enter the Web
                </Link>
                {/* <Link to="/register" className="secondary-btn">
                  Register
                </Link> */}
              </div>
            </div>
          </div>
        </section>
      </main>

      <style>{`
        /* =====================================================
           NEO-COMIC HOME PAGE
           Off-White canvas · Sharp corners · Hard offsets
           ===================================================== */

        .theme-page {
          width: 100%;
          color: ${COLOR.black};
          overflow-x: hidden;
          background: ${COLOR.offWhite};
        }

        .page-shell {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding-left: 16px;
          padding-right: 16px;
          box-sizing: border-box;
        }

        @media (min-width: 1024px) {
          .page-shell {
            padding-left: 64px;
            padding-right: 64px;
          }
        }

        /* =====================================================
           HERO
           ===================================================== */

        .page-hero {
          position: relative;
          padding: 5rem 0 4.5rem;
          background: ${COLOR.offWhite};
          overflow: hidden;
          border-bottom: 2px solid ${COLOR.black};
        }

        /*
           Diagonal cross-pattern grid overlay — desktop only.
           Reads like a spider web; mirrors the About page grid bg.
        */
        @media (min-width: 1024px) {
          .home-hero-grid::before {
            content: "";
            position: absolute;
            inset: 0;
            z-index: 0;
            pointer-events: none;
            background-image:
              repeating-linear-gradient(45deg, rgba(26,26,26,0.05) 0 1px, transparent 1px 28px),
              repeating-linear-gradient(-45deg, rgba(26,26,26,0.05) 0 1px, transparent 1px 28px);
          }
        }

        .page-hero .page-shell {
          display: flex;
          justify-content: center;
        }

        .hero-copy {
          max-width: 880px;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .hero-kicker {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          margin: 0 0 0.4rem;
          padding: 0.4rem 0.85rem;
          background: ${COLOR.black};
          color: #ffffff;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .kicker-mark {
          width: 8px;
          height: 8px;
          background: ${COLOR.red};
          display: inline-block;
        }

        .display-title {
          margin: 1.2rem 0 0;
          font-family: 'Brusher', cursive;
          font-size: clamp(4.5rem, 14vw, 11rem);
          line-height: 0.92;
          letter-spacing: 0.03em;
          color: ${COLOR.blackDeep};
          word-break: break-word;
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 0.08em;
        }

        .display-year {
          font-family: 'Brusher', cursive;
          font-size: clamp(2.4rem, 7.5vw, 5rem);
          line-height: 1;
          letter-spacing: 0.05em;
          color: ${COLOR.red};
        }

        .hero-subtitle {
          margin: 0.6rem 0 0;
          font-family: 'Anton', sans-serif;
          font-weight: 400;
          font-size: clamp(1.4rem, 3vw, 2rem);
          line-height: 1;
          letter-spacing: 0.06em;
          color: ${COLOR.red};
          text-transform: uppercase;
        }

        .hero-description {
          max-width: 640px;
          margin: 1.5rem auto 0;
          font-family: 'Hanken Grotesk', sans-serif;
          font-weight: 400;
          font-size: 1.1rem;
          line-height: 1.65;
          color: ${COLOR.black};
        }

        /* =====================================================
           META CHIPS
           ===================================================== */

        .hero-meta {
          display: flex;
          flex-wrap: nowrap;
          justify-content: center;
          gap: 0;
          margin-top: 2rem;
        }

        .meta-chip {
          display: inline-flex;
          align-items: center;
          padding: 0.55rem 1rem;
          background: ${COLOR.black};
          color: #ffffff;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          border: 2px solid ${COLOR.black};
          border-right-width: 0;
          white-space: nowrap;
        }

        .meta-chip:last-child {
          border-right-width: 2px;
        }

        .meta-chip--red {
          background: ${COLOR.red};
          border-color: ${COLOR.red};
        }

        /* =====================================================
           COUNTDOWN
           ===================================================== */

        .countdown-block {
          position: relative;
          margin: 2.25rem auto 0;
          max-width: 640px;
          padding: 1.75rem 1.25rem;
          border: 1px solid rgba(220, 0, 0, 0.35);
          border-radius: 16px;
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.55));
          box-shadow:
            0 10px 30px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          overflow: hidden;
        }

        .countdown-block::after {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, rgba(220, 0, 0, 0.5), transparent);
        }

        .countdown-heading {
          margin: 0 0 0.9rem;
          font-family: 'Anton', sans-serif;
          font-size: 1.3rem;
          letter-spacing: 0.1em;
          color: #0d0d0d;
          text-transform: uppercase;
        }

        .timer-row {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          gap: 0.5rem;
          flex-wrap: nowrap;
        }

        .timer-unit {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.3rem;
          min-width: 3.2rem;
        }

        .timer-value {
          font-family: 'Anton', sans-serif;
          font-size: clamp(2rem, 6vw, 3.2rem);
          line-height: 1;
          color: #dc0000;
          background: linear-gradient(180deg, #1a1a1a, #0d0d0d);
          border: 1px solid rgba(220, 0, 0, 0.3);
          border-radius: 10px;
          padding: 0.55rem 0.65rem;
          min-width: 2.6rem;
          text-align: center;
          box-shadow:
            0 4px 12px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(220, 0, 0, 0.15);
        }

        .timer-label {
          font-family: 'Anton', sans-serif;
          font-size: 0.72rem;
          font-weight: 400;
          letter-spacing: 0.1em;
          color: #3a3a3a;
          text-transform: uppercase;
        }

        .timer-sep {
          font-family: 'Anton', sans-serif;
          font-size: clamp(2rem, 6vw, 3.2rem);
          line-height: 1;
          color: #0d0d0d;
          padding-top: 0.5rem;
        }

        .countdown-target {
          margin: 1rem 0 0;
          font-family: 'Anton', sans-serif;
          font-size: 0.88rem;
          font-weight: 400;
          letter-spacing: 0.1em;
          color: #6a6a6a;
          text-transform: uppercase;
        }

        .countdown-ended {
          margin: 0;
          font-family: 'Anton', sans-serif;
          font-size: 2rem;
          letter-spacing: 0.08em;
          color: #dc0000;
          text-transform: uppercase;
        }

        /* =====================================================
           CORNER WEB DECORATIONS
           ===================================================== */

        .corner-web {
          position: absolute;
          pointer-events: none;
          z-index: 0;
        }

        .hero-web-tl {
          top: -60px;
          left: 16px;
          width: 300px;
          height: 300px;
          opacity: 0.6;
        }

        .hero-web-br {
          bottom: 0;
          right: 0;
          width: 200px;
          height: 200px;
          transform: rotate(180deg);
          opacity: 0.45;
        }

        .timer-web-tr {
          top: -45px;
          right: -45px;
          width: 110px;
          height: 110px;
          transform: scaleX(-1);
          opacity: 0.5;
        }

        .countdown-block > *:not(.corner-web) {
          position: relative;
          z-index: 1;
        }

        /* =====================================================
           ANNOUNCEMENT MARQUEE
           ===================================================== */

        .announcement-block {
          margin-top: 2rem;
        }

        .announcement-marquee {
          overflow: hidden;
          white-space: nowrap;
          background: #dc0000;
          border: 2px solid #0d0d0d;
          border-radius: 999px;
          padding: 0.7rem 0;
          max-width: 520px;
          margin: 0 auto;
        }

        .announcement-marquee-text {
          display: inline-block;
          font-family: 'Anton', sans-serif;
          font-size: 1rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #ffffff;
          animation: marquee-scroll 10s linear infinite;
          padding-left: 100%;
        }

        @keyframes marquee-scroll {
          0%   { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }

        .announcement-subtext {
          margin: 0.8rem 0 0;
          font-family: 'Anton', sans-serif;
          font-size: clamp(0.85rem, 2vw, 1.1rem);
          letter-spacing: 0.06em;
          color: #0d0d0d;
          text-transform: uppercase;
          text-align: center;
        }

        /* =====================================================
           CTA
           ===================================================== */

        .cta-row {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 1.1rem;
          margin-top: 2.25rem;
        }

        .primary-btn {
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

        .primary-btn::after {
          content: "→";
          font-family: 'Hanken Grotesk', sans-serif;
          font-size: 1rem;
          transition: transform 0.2s ease;
        }

        .primary-btn:hover,
        .primary-btn:focus-visible {
          transform: translateY(-3px);
          background: #0d0d0d;
          color: #ffffff;
          box-shadow: 0 14px 30px rgba(0, 0, 0, 0.35);
        }

        .primary-btn:hover::after,
        .primary-btn:focus-visible::after {
          transform: translateX(4px);
        }

        .secondary-btn {
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
          background: transparent;
          color: #0d0d0d;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease;
        }

        .secondary-btn:hover,
        .secondary-btn:focus-visible {
          transform: translateY(-3px);
          background: #0d0d0d;
          color: #ffffff;
          box-shadow: 0 14px 30px rgba(0, 0, 0, 0.3);
        }

        /* =====================================================
           RESPONSIVE
           ===================================================== */

        @media (max-width: 1024px) {
          .page-hero {
            padding: 4rem 0 3.5rem;
          }
        }

        @media (max-width: 768px) {
          .page-hero {
            padding: 3.5rem 0 3rem;
          }

          .hero-web-tl {
            top: 0;
            left: 0;
            width: 150px;
            height: 150px;
            opacity: 0.6;
          }

          .hero-web-br {
            width: 120px;
            height: 120px;
          }

          .hero-description {
            font-size: 1rem;
          }

          .display-title {
            font-size: clamp(5rem, 16vw, 11rem);
          }

          .display-year {
            font-size: clamp(2.6rem, 9vw, 5rem);
          }

          .countdown-block {
            max-width: 420px;
            padding: 1.4rem 1rem;
            margin: 1.8rem auto 0;
          }
        }

        @media (max-width: 430px) {
          .page-shell {
            padding-left: 16px;
            padding-right: 16px;
          }

          .page-hero {
            padding: 2.75rem 0 2.25rem;
          }

          .display-title {
            font-size: clamp(5.5rem, 20vw, 11rem);
          }

          .display-year {
            font-size: clamp(2.9rem, 11vw, 5rem);
          }

          .countdown-block {
            max-width: 300px;
            padding: 1.1rem 0.8rem;
            margin: 1.5rem auto 0;
          }

          .countdown-heading {
            font-size: 1.05rem;
          }

          .meta-chip {
            padding: 0.4rem 0.55rem;
            font-size: 9px;
            letter-spacing: 0.08em;
          }

          .primary-btn,
          .secondary-btn {
            min-height: 46px;
            padding: 0.75rem 1.3rem;
            font-size: 0.98rem;
          }

          .cta-row {
            gap: 0.7rem;
          }

          .timer-unit {
            min-width: 2.4rem;
          }

          .timer-value {
            padding: 0.4rem 0.45rem;
            min-width: 2rem;
          }
        }

        @media (max-width: 360px) {
          .timer-row {
            gap: 0.2rem;
          }

          .timer-sep {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .primary-btn,
          .primary-btn::after,
          .secondary-btn {
            transition: none;
          }
        }

        @media (min-width: 1024px) {
          .home-grid-bg::before {
            content: "";
            position: absolute;
            inset: 0;
            z-index: 0;
            pointer-events: none;
            background-image:
              repeating-linear-gradient(45deg, rgba(26,26,26,0.05) 0 1px, transparent 1px 28px),
              repeating-linear-gradient(-45deg, rgba(26,26,26,0.05) 0 1px, transparent 1px 28px);
          }
        }
      `}</style>
    </>
  );
}
