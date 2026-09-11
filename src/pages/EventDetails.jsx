import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import SpiderWeb from "../components/navigation/SpiderWeb";
import eventData from "../data/eventData";

export default function EventDetails() {
  const { slug } = useParams();
  const [showRules, setShowRules] = useState(false);

  const event = eventData.find((item) => item.slug === slug);

  // Fallback for an invalid / unknown event URL
  if (!event) {
    return (
      <>
        <main className="ed-page">
          <section className="ed-hero">
            <SpiderWeb className="ed-web ed-web--tl" />
            <SpiderWeb className="ed-web ed-web--br" />

            <div className="ed-shell">
              <Link to="/events" className="ed-back">
                <span className="ed-back-arrow">←</span>
                All Events
              </Link>

              <div className="ed-hero-copy">
                <span className="ed-cat ed-cat--non">
                  Event Not Found
                </span>

                <h1 className="ed-title">Event Details</h1>
              </div>
            </div>
          </section>

          <section className="ed-body">
            <div className="ed-shell">
              <article className="ed-card ed-not-found">
                <h2 className="ed-card-heading">Event Not Found</h2>

                <p className="ed-card-text">
                  The event you are looking for does not exist or the link
                  may be incorrect.
                </p>

                <Link to="/events" className="ed-btn ed-btn--primary">
                  Back to Events
                  <span className="ed-btn-arrow">→</span>
                </Link>
              </article>
            </div>
          </section>
        </main>

        <style>{`
          .ed-page {
            width: 100%;
            background: #f5f5f5;
            color: #1a1a1a;
            overflow-x: hidden;
          }

          .ed-shell {
            width: 100%;
            max-width: 1100px;
            margin: 0 auto;
            padding-inline: 16px;
            box-sizing: border-box;
          }

          @media (min-width: 1024px) {
            .ed-shell {
              padding-inline: 64px;
            }
          }

          .ed-hero {
            position: relative;
            padding: 4rem 0 2.5rem;
            background: #f9f9f9;
            overflow: hidden;
            border-bottom: 2px solid #1a1a1a;
          }

          .ed-hero-copy {
            text-align: center;
            position: relative;
            z-index: 1;
          }

          .ed-back {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            margin-bottom: 1.5rem;
            font-family: 'Anton', sans-serif;
            font-size: 0.95rem;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: #dc0000;
            text-decoration: none;
            position: relative;
            z-index: 1;
          }

          .ed-back-arrow {
            display: inline-block;
          }

          .ed-cat {
            display: inline-flex;
            padding: 4px 12px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            margin-bottom: 0.8rem;
            border-radius: 6px;
          }

          .ed-cat--non {
            background: rgba(26, 26, 26, 0.06);
            border: 1px solid rgba(26, 26, 26, 0.3);
            color: #1a1a1a;
          }

          .ed-title {
            margin: 0;
            font-family: 'Anton', sans-serif;
            font-weight: 400;
            font-size: clamp(2rem, 6vw, 3.2rem);
            line-height: 1;
            letter-spacing: 0.04em;
            color: #0d0d0d;
            text-transform: uppercase;
          }

          .ed-body {
            padding: 2.5rem 0 4rem;
            background: #f5f5f5;
          }

          .ed-card {
            position: relative;
            padding: 24px;
            border: 1px solid rgba(220, 0, 0, 0.35);
            border-radius: 16px;
            background:
              linear-gradient(
                135deg,
                rgba(255, 255, 255, 0.75),
                rgba(255, 255, 255, 0.55)
              );
            box-shadow:
              0 10px 30px rgba(0, 0, 0, 0.08),
              inset 0 1px 0 rgba(255, 255, 255, 0.8);
            overflow: hidden;
          }

          .ed-card::after {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background:
              linear-gradient(
                90deg,
                transparent,
                rgba(220, 0, 0, 0.5),
                transparent
              );
          }

          .ed-card-heading {
            margin: 0 0 1rem;
            font-family: 'Anton', sans-serif;
            font-size: 1.15rem;
            font-weight: 400;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #dc0000;
          }

          .ed-card-text {
            margin: 0 0 1.5rem;
            font-family: 'Hanken Grotesk', sans-serif;
            font-size: 1rem;
            line-height: 1.7;
            color: #3a3a3a;
          }

          .ed-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            min-height: 50px;
            padding: 0.9rem 1.8rem;
            border: 2px solid #1a1a1a;
            border-radius: 999px;
            font-family: 'Anton', sans-serif;
            font-size: 1rem;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            text-decoration: none;
            transition:
              transform 0.2s ease,
              box-shadow 0.2s ease,
              background 0.2s ease,
              color 0.2s ease;
          }

          .ed-btn--primary {
            background: #dc0000;
            color: #ffffff;
            box-shadow: 0 8px 22px rgba(220, 0, 0, 0.3);
          }

          .ed-btn--primary:hover {
            transform: translateY(-3px);
            background: #0d0d0d;
            color: #ffffff;
            box-shadow: 0 14px 30px rgba(0, 0, 0, 0.3);
          }

          .ed-btn-arrow {
            display: inline-block;
            transition: transform 0.2s;
          }

          .ed-btn--primary:hover .ed-btn-arrow {
            transform: translateX(4px);
          }

          .ed-web {
            position: absolute;
            pointer-events: none;
            z-index: 0;
          }

          .ed-web--tl {
            top: -50px;
            left: 16px;
            width: 220px;
            height: 220px;
            opacity: 0.45;
          }

          .ed-web--br {
            bottom: 0;
            right: 0;
            width: 160px;
            height: 160px;
            transform: rotate(180deg);
            opacity: 0.3;
          }

          @media (max-width: 768px) {
            .ed-hero {
              padding: 3rem 0 1.5rem;
            }

            .ed-body {
              padding: 2rem 0 3rem;
            }
          }

          @media (max-width: 430px) {
            .ed-hero {
              padding: 2.5rem 0 1.25rem;
            }

            .ed-title {
              font-size: clamp(1.5rem, 8vw, 2rem);
            }

            .ed-web--tl {
              width: 130px;
              height: 130px;
            }

            .ed-web--br {
              width: 100px;
              height: 100px;
            }

            .ed-card {
              padding: 20px;
            }

            .ed-btn {
              width: 100%;
            }
          }
        `}</style>
      </>
    );
  }

  const isTech = event.category === "Technical";

  return (
    <>
      <main className="ed-page">
        {/* ═══════════════════════════════════════════════════════════
            HERO
        ═══════════════════════════════════════════════════════════ */}

        <section className="ed-hero">
          <SpiderWeb className="ed-web ed-web--tl" />
          <SpiderWeb className="ed-web ed-web--br" />

          <div className="ed-shell">
            <Link to="/events" className="ed-back">
              <span className="ed-back-arrow">←</span>
              All Events
            </Link>

            <div className="ed-hero-copy">
              <span
                className={`ed-cat${
                  isTech ? " ed-cat--tech" : " ed-cat--non"
                }`}
              >
                {event.category}
              </span>

              <h1 className="ed-title">{event.description}</h1>
            </div>
          </div>

          {event.chibi && (
            <img src={event.chibi} alt="" className="ed-chibi" />
          )}
        </section>

        {/* ═══════════════════════════════════════════════════════════
            EVENT DETAILS
        ═══════════════════════════════════════════════════════════ */}

        <section className="ed-body">
          <div className="ed-shell">
            <div className="ed-grid">

              {/* LEFT COLUMN */}
              <div className="ed-left-column">

                {/* ABOUT */}
                <article className="ed-card">
                  <h2 className="ed-card-heading">
                    About this event
                  </h2>

                  <p className="ed-card-text">
                    {event.description}
                  </p>
                </article>

                {/* RULES - DESKTOP */}
                <article className="ed-card ed-rules-card">
                  <h2 className="ed-card-heading">
                    Rules
                  </h2>

                  {Array.isArray(event.rules) &&
                  event.rules.length > 0 ? (
                    <ol className="ed-rules-list">
                      {event.rules.map((rule, index) => (
                        <li key={index}>{rule}</li>
                      ))}
                    </ol>
                  ) : (
                    <p className="ed-meta-value">
                      To be announced.
                    </p>
                  )}
                </article>

              </div>

              {/* RIGHT COLUMN - DETAILS */}
              <article className="ed-card">
                <h2 className="ed-card-heading">
                  Details
                </h2>

                <ul className="ed-meta">

                  {/* MOBILE ONLY - VIEW RULES */}
                  <li className="ed-meta-item ed-rules-mobile-item">
                    <span className="ed-meta-label">
                      Rules
                    </span>

                    <button
                      type="button"
                      className="ed-rules-mobile-btn"
                      onClick={() => setShowRules(true)}
                    >
                      <span>View Rules</span>
                      <span className="ed-rules-mobile-arrow">
                        →
                      </span>
                    </button>
                  </li>

                  {/* TEAM SIZE */}
                  <li className="ed-meta-item">
                    <span className="ed-meta-label">
                      Team size
                    </span>

                    <span className="ed-meta-value">
                      {event.teamSize || "To be announced."}
                    </span>
                  </li>

                  {/* REGISTRATION FEE */}
                  <li className="ed-meta-item">
                    <span className="ed-meta-label">
                      Registration fee
                    </span>

                    <span className="ed-meta-value">
                      {event.registrationFee || "To be announced."}
                    </span>
                  </li>

                  {/* VENUE */}
                  <li className="ed-meta-item">
                    <span className="ed-meta-label">
                      Venue
                    </span>

                    <span className="ed-meta-value">
                      {event.venue || "To be announced."}
                    </span>
                  </li>

                  {/* TIME */}
                  <li className="ed-meta-item">
                    <span className="ed-meta-label">
                      Time
                    </span>

                    <span className="ed-meta-value">
                      {event.time || "To be announced."}
                    </span>
                  </li>

                  {/* MAX CAPACITY */}
                  <li className="ed-meta-item">
                    <span className="ed-meta-label">
                      Max capacity
                    </span>

                    <span className="ed-meta-value">
                      {event.maxCapacity || "To be announced."}
                    </span>
                  </li>

                  {/* COORDINATOR */}
                  <li className="ed-meta-item">
                    <span className="ed-meta-label">
                      Coordinator
                    </span>

                    <span className="ed-meta-value">
                      {event.coordinator || "To be announced."}
                    </span>

                    {event.coordinatorContact && (
                      <a
                        href={`tel:${event.coordinatorContact.replace(
                          /[^0-9+]/g,
                          ""
                        )}`}
                        className="ed-coordinator-contact"
                      >
                        <span className="ed-coordinator-phone">
                          ☎
                        </span>
                        {event.coordinatorContact}
                      </a>
                    )}
                  </li>

                </ul>
              </article>

            </div>

            {/* MOBILE RULES MODAL */}
            {showRules && (
              <div
                className="ed-rules-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="ed-rules-modal-title"
                onClick={() => setShowRules(false)}
              >
                <div
                  className="ed-rules-modal-card"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="ed-rules-modal-header">
                    <div>
                      <span className="ed-meta-label">
                        Event Rules
                      </span>

                      <h2
                        id="ed-rules-modal-title"
                        className="ed-rules-modal-title"
                      >
                        {event.description}
                      </h2>
                    </div>

                    <button
                      type="button"
                      className="ed-rules-close"
                      onClick={() => setShowRules(false)}
                      aria-label="Close rules"
                    >
                      ×
                    </button>
                  </div>

                  <div className="ed-rules-modal-body">
                    {Array.isArray(event.rules) &&
                    event.rules.length > 0 ? (
                      <ol className="ed-rules-list">
                        {event.rules.map((rule, index) => (
                          <li key={index}>{rule}</li>
                        ))}
                      </ol>
                    ) : (
                      <p className="ed-meta-value">
                        Rules to be announced.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ACTIONS */}
            <div className="ed-actions">
              {/* <Link
                to={`/register?event=${event.slug}`}
                className="ed-btn ed-btn--primary"
              >
                Register Now
                <span className="ed-btn-arrow">→</span>
              </Link> */}

              <Link
                to="/events"
                className="ed-btn ed-btn--secondary"
              >
                Back to Events
              </Link>
            </div>
          </div>
        </section>
      </main>

      <style>{`
        .ed-page {
          width: 100%;
          background: #f5f5f5;
          color: #1a1a1a;
          overflow-x: hidden;
        }

        .ed-shell {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          padding-inline: 16px;
          box-sizing: border-box;
        }

        @media (min-width: 1024px) {
          .ed-shell {
            padding-inline: 64px;
          }
        }

        /* ═══ HERO ═══ */

        .ed-hero {
          position: relative;
          padding: 4rem 0 2.5rem;
          background: #f9f9f9;
          overflow: hidden;
          border-bottom: 2px solid #1a1a1a;
        }

        .ed-hero-copy {
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .ed-back {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          margin-bottom: 1.5rem;
          font-family: 'Anton', sans-serif;
          font-size: 0.95rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #dc0000;
          text-decoration: none;
          position: relative;
          z-index: 1;
          transition: color 0.2s;
        }

        .ed-back:hover {
          color: #0d0d0d;
        }

        .ed-back-arrow {
          display: inline-block;
          transition: transform 0.2s;
        }

        .ed-back:hover .ed-back-arrow {
          transform: translateX(-4px);
        }

        .ed-cat {
          display: inline-flex;
          padding: 4px 12px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 0.8rem;
          border-radius: 6px;
        }

        .ed-cat--tech {
          background: rgba(220, 0, 0, 0.08);
          border: 1px solid rgba(220, 0, 0, 0.4);
          color: #dc0000;
        }

        .ed-cat--non {
          background: rgba(26, 26, 26, 0.06);
          border: 1px solid rgba(26, 26, 26, 0.3);
          color: #1a1a1a;
        }

        .ed-title {
          margin: 0;
          font-family: 'Anton', sans-serif;
          font-weight: 400;
          font-size: clamp(2rem, 6vw, 3.2rem);
          line-height: 1;
          letter-spacing: 0.04em;
          color: #0d0d0d;
          text-transform: uppercase;
        }

        .ed-chibi {
          position: absolute;
          right: 355px;
          bottom: 3px;
          width: 200px;
          height: auto;
          pointer-events: none;
        }

        .ed-web {
          position: absolute;
          pointer-events: none;
          z-index: 0;
        }

        .ed-web--tl {
          top: -50px;
          left: 16px;
          width: 220px;
          height: 220px;
          opacity: 0.45;
        }

        .ed-web--br {
          bottom: 7px;
          right: 375px;
          width: 150px;
          height: 150px;
          transform: rotate(180deg);
          opacity: 0.3;
        }

        /* ═══ BODY / GRID ═══ */

        .ed-body {
          padding: 2.5rem 0 4rem;
          background: #f5f5f5;
        }

        .ed-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 24px;
          align-items: start;
        }

        .ed-left-column {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* ═══ GLASS CARD ═══ */

        .ed-card {
          position: relative;
          padding: 24px;
          border: 1px solid rgba(220, 0, 0, 0.35);
          border-radius: 16px;
          background:
            linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.75),
              rgba(255, 255, 255, 0.55)
            );
          box-shadow:
            0 10px 30px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          overflow: hidden;
        }

        .ed-card::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(220, 0, 0, 0.5),
              transparent
            );
          pointer-events: none;
        }

        .ed-card-heading {
          margin: 0 0 1rem;
          font-family: 'Anton', sans-serif;
          font-size: 1.15rem;
          font-weight: 400;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #dc0000;
        }

        .ed-card-text {
          margin: 0;
          font-family: 'Hanken Grotesk', sans-serif;
          font-size: 1rem;
          line-height: 1.7;
          color: #3a3a3a;
        }

        /* ═══ META LIST ═══ */

        .ed-meta {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 0;
        }

        .ed-meta-item {
          display: grid;
          gap: 0.2rem;
          padding: 0.85rem 0;
          border-bottom: 1px solid rgba(26, 26, 26, 0.1);
        }

        .ed-meta-item:first-child {
          padding-top: 0;
        }

        .ed-meta-item:last-child {
          border-bottom: 0;
          padding-bottom: 0;
        }

        .ed-meta-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #6a6a6a;
        }

        .ed-meta-value {
          font-family: 'Hanken Grotesk', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: #1a1a1a;
        }

        /* ═══ COORDINATOR CONTACT ═══ */

        .ed-coordinator-contact {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          width: fit-content;
          margin-top: 0.15rem;
          font-family: 'Hanken Grotesk', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          color: #dc0000;
          text-decoration: none;
          transition:
            color 0.2s ease,
            transform 0.2s ease;
        }

        .ed-coordinator-contact:hover {
          color: #0d0d0d;
          transform: translateX(2px);
        }

        .ed-coordinator-phone {
          font-size: 0.9rem;
        }

        /* ═══ RULES ═══ */

        .ed-rules-card {
          display: block;
        }

        .ed-rules-list {
          margin: 0.65rem 0 0;
          padding-left: 1.35rem;
          font-family: 'Hanken Grotesk', sans-serif;
          font-size: 0.95rem;
          line-height: 1.65;
          color: #1a1a1a;
        }

        .ed-rules-list li {
          padding-left: 0.3rem;
          margin-bottom: 0.65rem;
        }

        .ed-rules-list li:last-child {
          margin-bottom: 0;
        }

        .ed-rules-mobile-item {
          display: none;
        }

        .ed-rules-mobile-btn {
          display: none;
        }

        /* ═══ RULES MODAL ═══ */

        .ed-rules-modal {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(13, 13, 13, 0.7);
          backdrop-filter: blur(6px);
        }

        .ed-rules-modal-card {
          width: min(700px, 100%);
          max-height: min(80vh, 700px);
          overflow: hidden;
          border: 1px solid rgba(220, 0, 0, 0.45);
          border-radius: 18px;
          background: #ffffff;
          box-shadow: 0 25px 70px rgba(0, 0, 0, 0.35);
        }

        .ed-rules-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          padding: 22px 24px;
          border-bottom: 1px solid rgba(26, 26, 26, 0.1);
        }

        .ed-rules-modal-title {
          margin: 0.3rem 0 0;
          font-family: 'Anton', sans-serif;
          font-size: 1.6rem;
          font-weight: 400;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #dc0000;
        }

        .ed-rules-close {
          flex: 0 0 auto;
          width: 40px;
          height: 40px;
          border: 2px solid #1a1a1a;
          border-radius: 50%;
          background: #ffffff;
          color: #1a1a1a;
          font-size: 1.5rem;
          line-height: 1;
          cursor: pointer;
          transition:
            background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        .ed-rules-close:hover {
          background: #dc0000;
          color: #ffffff;
          transform: rotate(90deg);
        }

        .ed-rules-modal-body {
          max-height: calc(min(80vh, 700px) - 100px);
          overflow-y: auto;
          padding: 24px;
        }

        .ed-rules-modal-body .ed-rules-list {
          margin-top: 0;
          font-size: 1rem;
          line-height: 1.7;
        }

        /* ═══ ACTIONS ═══ */

        .ed-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-top: 2rem;
        }

        .ed-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          min-height: 50px;
          padding: 0.9rem 1.8rem;
          border: 2px solid #1a1a1a;
          border-radius: 999px;
          font-family: 'Anton', sans-serif;
          font-size: 1rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          text-decoration: none;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease,
            color 0.2s ease;
        }

        .ed-btn--primary {
          background: #dc0000;
          color: #ffffff;
          box-shadow: 0 8px 22px rgba(220, 0, 0, 0.3);
        }

        .ed-btn--primary:hover {
          transform: translateY(-3px);
          background: #0d0d0d;
          color: #ffffff;
          box-shadow: 0 14px 30px rgba(0, 0, 0, 0.3);
        }

        .ed-btn-arrow {
          display: inline-block;
          transition: transform 0.2s;
        }

        .ed-btn--primary:hover .ed-btn-arrow {
          transform: translateX(4px);
        }

        .ed-btn--secondary {
          background: transparent;
          color: #0d0d0d;
        }

        .ed-btn--secondary:hover {
          transform: translateY(-3px);
          background: #0d0d0d;
          color: #ffffff;
          box-shadow: 0 14px 30px rgba(0, 0, 0, 0.25);
        }

        /* ═══ RESPONSIVE ═══ */

        @media (max-width: 1024px) {
          .ed-hero {
            padding: 3.5rem 0 2rem;
          }
        }

        @media (max-width: 768px) {
          .ed-hero {
            padding: 3rem 0 1.5rem;
          }

          .ed-title {
            font-size: clamp(1.8rem, 7vw, 2.5rem);
          }

          .ed-grid {
            grid-template-columns: 1fr;
          }

          .ed-left-column {
            display: contents;
          }

          .ed-body {
            padding: 2rem 0 3rem;
          }

          /* Mobile: About stays visible */
          .ed-left-column > .ed-card:first-child {
            order: 1;
          }

          /* Mobile: Rules card becomes hidden */
          .ed-rules-card {
            display: none;
          }

          /* Mobile: Details comes after About */
          .ed-grid > .ed-card {
            order: 2;
          }

          /* Mobile: View Rules button */
          .ed-rules-mobile-item {
            display: grid;
          }

          .ed-rules-mobile-btn {
            display: inline-flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            margin-top: 0.6rem;
            padding: 0.8rem 1rem;
            border: 1.5px solid #dc0000;
            border-radius: 10px;
            background: rgba(220, 0, 0, 0.05);
            color: #dc0000;
            font-family: 'Anton', sans-serif;
            font-size: 0.9rem;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            cursor: pointer;
          }

          .ed-rules-mobile-arrow {
            font-size: 1.1rem;
          }

          /* Mobile rules modal */
          .ed-rules-modal {
            align-items: flex-end;
            padding: 10px;
          }

          .ed-rules-modal-card {
            max-height: 85vh;
            border-radius: 18px 18px 10px 10px;
          }

          .ed-rules-modal-header {
            padding: 18px;
          }

          .ed-rules-modal-title {
            font-size: 1.3rem;
          }

          .ed-rules-modal-body {
            max-height: calc(85vh - 90px);
            padding: 18px;
          }

          .ed-rules-modal-body .ed-rules-list {
            font-size: 0.92rem;
            line-height: 1.6;
          }
        }

        @media (max-width: 430px) {
          .ed-hero {
            padding: 2.5rem 0 1.25rem;
          }

          .ed-title {
            font-size: clamp(1.5rem, 8vw, 2rem);
            margin-left: 30px;
          }

          .ed-chibi {
            right: 17rem;
            bottom: 1px;
            width: 110px;
          }

          .ed-web--tl {
            display: none;
          }

          .ed-web--br {
            width: 80px;
            height: 80px;
            right: 18rem;
            bottom: 18px;
          }

          .ed-body {
            padding: 1.5rem 0 2.5rem;
          }

          .ed-card {
            padding: 20px;
          }

          .ed-actions {
            flex-direction: column;
          }

          .ed-btn {
            width: 100%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ed-btn {
            transition: none;
          }

          .ed-btn-arrow {
            transition: none;
          }

          .ed-back {
            transition: none;
          }

          .ed-back-arrow {
            transition: none;
          }

          .ed-coordinator-contact {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}