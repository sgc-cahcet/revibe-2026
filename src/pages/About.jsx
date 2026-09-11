import DriftWall from "../components/DriftWall";
import SpiderWeb from "../components/navigation/SpiderWeb";

const driftWallItems = [
  {
    image: "https://res.cloudinary.com/djm8qhle1/image/upload/v1788092006/IMG_2481_pgbib0.jpg",
    title: "REVIBE '24",
  },
  {
    image: "https://res.cloudinary.com/djm8qhle1/image/upload/v1788092056/IMG_2819_zgcaav.jpg",
    title: "REVIBE '24",
  },
  {
    image: "https://res.cloudinary.com/djm8qhle1/image/upload/v1788092056/IMG_20240427_171249_ztrtka.jpg",
    title: "REVIBE '24",
  },
  {
    image: "https://res.cloudinary.com/djm8qhle1/image/upload/v1788092047/IMG_2672_p41z5f.jpg",
    title: "REVIBE '24",
  },


  {
    image: "https://res.cloudinary.com/dbqjkjl0c/image/upload/v1788892570/WhatsApp_Image_2026-09-08_at_11.40.50_PM_z5imij.jpg",
    title: "REVIBE '24",
  },
  {
    image: "https://res.cloudinary.com/dbqjkjl0c/image/upload/v1788892570/WhatsApp_Image_2026-09-08_at_11.40.52_PM_md8vks.jpg",
    title: "REVIBE '24",
  },
  {
    image: "https://res.cloudinary.com/dbqjkjl0c/image/upload/v1788892570/WhatsApp_Image_2026-09-08_at_11.40.51_PM_rsf8kj.jpg",
    title: "REVIBE '24",
  },
  {
    image: "https://res.cloudinary.com/dbqjkjl0c/image/upload/v1788892569/WhatsApp_Image_2026-09-08_at_11.40.53_PM_uu62s0.jpg",
    title: "REVIBE '24",
  },


  {
    image: "https://res.cloudinary.com/dbqjkjl0c/image/upload/v1788892569/WhatsApp_Image_2026-09-08_at_11.40.57_PM_wumwhz.jpg",
    title: "REVIBE '24",
  },
  {
    image: "https://res.cloudinary.com/dbqjkjl0c/image/upload/v1788892570/WhatsApp_Image_2026-09-08_at_11.40.54_PM_1_howjry.jpg",
    title: "REVIBE '24",
  },
  {
    image: "https://res.cloudinary.com/dbqjkjl0c/image/upload/v1788892569/WhatsApp_Image_2026-09-08_at_11.40.54_PM_cieifq.jpg",
    title: "REVIBE '24",
  },
  {
    image: "https://res.cloudinary.com/dbqjkjl0c/image/upload/v1788892569/WhatsApp_Image_2026-09-08_at_11.40.58_PM_w8eq4a.jpg",
    title: "REVIBE '24",
  },

];

const sponsors = [
  {
    name: "Golden Tasty Treats",
    blurb: "Freshly made waffles, crispy on the outside and deliciously soft inside. A perfect blend of sweet toppings, rich flavors, and irresistible goodness.",
    logo: "https://res.cloudinary.com/djm8qhle1/image/upload/v1788365758/WhatsApp_Image_2026-09-02_at_9.24.29_PM_alxsiv.jpg",
  },
  {
    name: "Jawa - Yezdi",
    blurb: "Iconic motorcycles built for the free spirit, blending vintage charm with modern performance. Ride bold, ride timeless — where every road tells a story.",
    logo: "https://res.cloudinary.com/djm8qhle1/image/upload/v1788370159/WhatsApp_Image_2026-09-02_at_10.10.18_PM_cty8uu.jpg",
  },
  {
    name: "K.V. CAFE",
    blurb: "From crispy fry favourites and steamed momos to fresh juices, milkshakes and refreshing mojitos, K.V. CAFE serves up a tasty variety for every craving — with favourites starting from just ₹20.",
    logo: "https://res.cloudinary.com/dbqjkjl0c/image/upload/v1788885098/KVCAFE_z2fcea.jpg",
  },
  {
    name: "Funk It",
    blurb: "Fusing bold flavors, fun vibes, and irresistible bites.",
    logo: "https://res.cloudinary.com/djm8qhle1/image/upload/v1788459115/Fusk_it.jpg_mlqfck.png",
  },
  {
    name: "Tibet Momo",
    blurb: "Authentic Tibetan momos with savory fillings and traditional steamed preparation, bringing the taste of the Himalayas to every bite.",
    logo: "https://res.cloudinary.com/djm8qhle1/image/upload/v1788628223/ChatGPT_Image_Sep_5_2026_10_40_05_PM_iwxbjz.png",
  },
  {
    name: "JN creations",
    blurb: "Seller of exquisite ornaments, adding charm and elegance to everyday occasions.",
    logo: "https://res.cloudinary.com/djm8qhle1/image/upload/v1788711528/JN_Creations_y4suxz.jpg",
  },
  {
    name: "Fuszz Studio",
    blurb: "Fussz Studo is a creative brand that turns personal memories into unique, handcrafted keepsakes. They specialize in custom-made products that capture the essence of special moments, allowing customers to preserve their cherished memories in a tangible and artistic way.",
    logo: "https://res.cloudinary.com/djm8qhle1/image/upload/v1788885497/Fussz_Studios_ndww6s.jpg",
  },
  {
    name: "Moon Pearls",
    blurb: "A trusted seller of exquisite ornaments, offering beautifully crafted pieces that add a touch of charm, elegance, and timeless sophistication to every special moment and everyday occasion.",
    logo: "https://res.cloudinary.com/djm8qhle1/image/upload/v1788885497/Moon_Pearls_tetmlh.jpg",
  },
  {
    name: "Doods Holidays",
    blurb: "Provides a wide range of tour packages and travel experiences tailored to different destinations and travel preferences.",
    logo: "https://res.cloudinary.com/djm8qhle1/image/upload/v1788976182/Doods_holidasy_lka9w1.jpg",
  },
  {
    name: "Wingsonn Holidays",
    blurb: "Offers tour packages and travel services designed to make vacations convienient, enjoyable and memorable.",
    logo: "https://res.cloudinary.com/djm8qhle1/image/upload/v1788976182/Winsonn_r572ur.jpg",
  },
];

function SponsorTier({ sponsors }) {
  const sponsorSet = (isDuplicate = false) => (
    <div className="ws-sponsors-set" aria-hidden={isDuplicate}>
      {sponsors.map((sponsor) => (
        <article className="ws-sponsor-card" key={`${sponsor.name}-${isDuplicate}`}>
          <div className="ws-sponsor-logo" aria-label={`${sponsor.name} logo`}>
            {sponsor.logo ? (
              <img src={sponsor.logo} alt={`${sponsor.name} logo`} />
            ) : (
              <span>LOGO</span>
            )}
          </div>
          <div className="ws-sponsor-info">
            <h3 className="ws-sponsor-name">{sponsor.name}</h3>
            <p className="ws-sponsor-blurb">{sponsor.blurb}</p>
          </div>
        </article>
      ))}
    </div>
  );

  return (
    <div className="ws-sponsors-grid" aria-label="Sponsors carousel" tabIndex={0}>
      <div className="ws-sponsors-track">
        {sponsorSet()}
        {sponsorSet(true)}
      </div>
    </div>
  );
}

export default function About() {
  return (
    <>
      <main className="ws-page">
        {/* ============================================================
            HERO — ORIGIN STORY
            ============================================================ */}
        <section className="ws-hero ws-grid-bg" aria-labelledby="about-title">
          <div className="ws-container ws-container--narrow">
            <p className="ws-label">About REVIBE</p>

            <h1 id="about-title" className="ws-display">
              Every legend has an origin story.
            </h1>

            <div className="ws-origin-trio">
              <p>Before the lights.</p>
              <p>Before the crowds.</p>
              <p>Before the challenges begin…</p>
            </div>

            <p className="ws-accent-line">There was an idea.</p>

            <p className="ws-body-lg">
              An idea to connect curious minds, bold creators and fierce
              competitors under one web.
            </p>

            <p className="ws-mid">That idea became REVIBE&nbsp;'26.</p>

            <p className="ws-body-lg">
              A National Level Symposium where technology meets creativity,
              strategy meets skill, and every participant gets a chance to step
              into their own universe.
            </p>

            <p className="ws-strong">Different talents. Different battles. One web.</p>

            <p className="ws-welcome">Welcome to REVIBE&nbsp;'26.</p>

            <p className="ws-date">12.09.2026</p>

            <p className="ws-battle">Your Battleground is on!</p>
          </div>
        </section>

        <hr className="ws-rule" aria-hidden="true" />

        {/* ============================================================
            SPONSORS
            ============================================================ */}
        <section className="ws-section" aria-labelledby="sponsors-title">
          <div className="ws-container">
            <p className="ws-label">Our Partners</p>
            <h2 id="sponsors-title" className="ws-headline">
              Our Sponsors
            </h2>
            <SponsorTier sponsors={sponsors} />
          </div>
        </section>

        <hr className="ws-rule" aria-hidden="true" />

        {/* ============================================================
            PREVIOUS EDITION
            ============================================================ */}
        <section className="ws-section" aria-labelledby="prev-title">
          <div className="ws-container">
            <p className="ws-label">Previous edition</p>
            <h2 id="prev-title" className="ws-headline">
              Previous REVIBE Gallery
            </h2>
            <p className="ws-body">
              Highlights and photos from REVIBE '24.
            </p>

            <div className="ws-drift-wall-wrap" aria-label="Previous REVIBE gallery">
              <SpiderWeb className="ws-gallery-web ws-gallery-web--center" />
              <SpiderWeb className="ws-gallery-web ws-gallery-web--tl" />
              <SpiderWeb className="ws-gallery-web ws-gallery-web--br" />
              <DriftWall
                items={driftWallItems}
                columns={5}
                tileWidth={200}
                tileHeight={132}
                gap={18}
                tilt={16}
                turn={-14}
                perspective={1200}
                depth={120}
                speed={42}
                direction="up"
                variance={0.45}
                parallax={0.6}
                lift={64}
                fade={0.6}
                dim={0.55}
                overlayColor="#060010"
                radius={14}
                roll={0}
                pauseOnHover={false}
                grayscale={false}
              />
            </div>
          </div>
        </section>

        <hr className="ws-rule" aria-hidden="true" />

        {/* ============================================================
            ORGANIZED BY — ABOUT SGC
            ============================================================ */}
        <section className="ws-section ws-grid-bg" aria-labelledby="sgc-title">
          <div className="ws-container ws-container--narrow">
            <p className="ws-label">Organized by</p>
            <h2 id="sgc-title" className="ws-headline">Student Guidance Cell</h2>
            <p className="ws-tagline">Zeal and Zest to be</p>

            <p className="ws-body-lg">
              The Student Guidance Cell (SGC) is a student-driven platform created
              to help students move beyond the classroom and discover what they're
              capable of.
            </p>

            <p className="ws-body-lg">
              From technical exposure and workshops to competitions, events and
              opportunities, SGC creates spaces where students can learn, connect,
              experiment and lead.
            </p>

            <p className="ws-accent-line">Because talent isn't just about what you know.</p>
            <p className="ws-strong">It's about what you do with it.</p>

            <p className="ws-mantra">Connect. Guide. Empower.</p>

            <p className="ws-body-lg">
              And REVIBE&nbsp;'26 is one of the webs we built to bring those
              possibilities together.
            </p>
          </div>
        </section>
      </main>

      <style>{`
        /* =========================================================
           WEB-SLINGER MODERN — About page
           Flat-Brutalist / Neo-Comic design system
           Off-white surface · 2px black borders · sharp corners ·
           hard offset shadows · Anton / Hanken Grotesk / JetBrains Mono
           8px grid · 12-col desktop (64px margin) · 4-col mobile (16px)
        ========================================================= */

        .ws-page {
          width: 100%;
          background: #f5f5f5;
          color: #1a1a1a;
          overflow-x: hidden;
          font-family: 'Hanken Grotesk', sans-serif;
        }

        .ws-container {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding-inline: 16px;
          box-sizing: border-box;
        }

        .ws-container--narrow {
          max-width: 900px;
        }

        /* ---------- sections ---------- */

        .ws-hero {
          position: relative;
          padding: 96px 0 72px;
          background: #f9f9f9;
          overflow: hidden;
        }

        /*
           Cross-pattern diagonal grid overlay — reads like a spider web.
           Applied to the About REVIBE hero and the About SGC section.
        */
        .ws-grid-bg::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-image:
            repeating-linear-gradient(45deg, rgba(26,26,26,0.05) 0 1px, transparent 1px 28px),
            repeating-linear-gradient(-45deg, rgba(26,26,26,0.05) 0 1px, transparent 1px 28px);
        }

        .ws-section {
          position: relative;
          padding: 72px 0;
          background: #f5f5f5;
          overflow: hidden;
        }

        .ws-hero-web {
          position: absolute;
          pointer-events: none;
          z-index: 0;
          opacity: 0.35;
        }

        .ws-hero-web--tl {
          top: 0;
          left: 0;
          width: 180px;
          height: 180px;
        }

        .ws-hero-web--tr {
          top: 0;
          right: 0;
          width: 140px;
          height: 140px;
          transform: scaleX(-1);
        }

        .ws-hero-web--bl {
          bottom: 0;
          left: 0;
          width: 140px;
          height: 140px;
          transform: scaleY(-1);
        }

        .ws-hero-web--br {
          bottom: 0;
          right: 0;
          width: 180px;
          height: 180px;
          transform: rotate(180deg);
        }

        .ws-hero .ws-container,
        .ws-section .ws-container {
          position: relative;
          z-index: 1;
        }

        /* ---------- heavy 2px black panel dividers ---------- */

        .ws-rule {
          display: block;
          width: 100%;
          height: 0;
          border: 0;
          border-top: 2px solid #1a1a1a;
          margin: 0;
        }

        /* ---------- typography ---------- */

        .ws-label {
          margin: 0 0 16px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 700;
          line-height: 16px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #dc0000;
        }

        .ws-display {
          margin: 0 0 32px;
          font-family: 'Anton', sans-serif;
          font-weight: 400;
          font-size: clamp(40px, 9vw, 84px);
          line-height: 0.98;
          letter-spacing: 0.01em;
          color: #1a1a1a;
          text-transform: uppercase;
        }

        .ws-origin-trio {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin: 0 0 28px;
          font-family: 'Anton', sans-serif;
          font-size: clamp(20px, 4vw, 32px);
          line-height: 1.1;
          letter-spacing: 0.02em;
          color: #1a1a1a;
        }

        .ws-origin-trio p {
          margin: 0;
        }

        .ws-accent-line {
          margin: 0 0 20px;
          font-family: 'Anton', sans-serif;
          font-size: clamp(22px, 4.5vw, 34px);
          line-height: 1.1;
          letter-spacing: 0.02em;
          color: #dc0000;
        }

        .ws-body-lg {
          margin: 0 0 20px;
          max-width: 760px;
          font-family: 'Hanken Grotesk', sans-serif;
          font-size: 18px;
          line-height: 28px;
          color: #1a1a1a;
        }

        .ws-mid {
          margin: 0 0 24px;
          font-family: 'Anton', sans-serif;
          font-size: clamp(26px, 5vw, 44px);
          line-height: 1;
          letter-spacing: 0.02em;
          color: #1a1a1a;
          text-transform: uppercase;
        }

        .ws-strong {
          margin: 0 0 24px;
          font-family: 'Anton', sans-serif;
          font-size: clamp(20px, 4vw, 30px);
          line-height: 1.15;
          letter-spacing: 0.03em;
          color: #1a1a1a;
          text-transform: uppercase;
        }

        .ws-welcome {
          margin: 0 0 16px;
          font-family: 'Anton', sans-serif;
          font-size: clamp(30px, 6vw, 52px);
          line-height: 1;
          letter-spacing: 0.02em;
          color: #1a1a1a;
          text-transform: uppercase;
        }

        .ws-date {
          display: inline-block;
          margin: 0 0 24px;
          padding: 8px 14px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: #ffffff;
          background: #1a1a1a;
          border-radius: 0;
        }

        .ws-battle {
          margin: 0;
          font-family: 'Anton', sans-serif;
          font-size: clamp(24px, 5vw, 40px);
          line-height: 1.1;
          letter-spacing: 0.02em;
          color: #dc0000;
          text-transform: uppercase;
        }

        .ws-tagline {
          margin: 0 0 24px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #dc0000;
        }

        .ws-mantra {
          margin: 24px 0;
          font-family: 'Anton', sans-serif;
          font-size: clamp(24px, 5vw, 40px);
          line-height: 1;
          letter-spacing: 0.04em;
          color: #ffffff;
          background: #dc0000;
          padding: 14px 18px;
          display: inline-block;
          text-transform: uppercase;
        }

        .ws-headline {
          margin: 0 0 20px;
          font-family: 'Anton', sans-serif;
          font-weight: 400;
          font-size: clamp(32px, 6vw, 48px);
          line-height: 1;
          letter-spacing: 0.02em;
          color: #1a1a1a;
          text-transform: uppercase;
        }

        .ws-body {
          margin: 0 0 8px;
          max-width: 760px;
          font-family: 'Hanken Grotesk', sans-serif;
          font-size: 16px;
          line-height: 24px;
          color: #3a3a3a;
        }

        /* ---------- cards (2px black border, sharp, hard offset) ---------- */

        .ws-card {
          position: relative;
          background: #ffffff;
          border: 2px solid #1a1a1a;
          border-radius: 0;
          box-shadow: 6px 6px 0 #1a1a1a;
          transition: box-shadow 0.18s ease, transform 0.18s ease;
        }

        .ws-card:hover,
        .ws-card:focus-within {
          box-shadow: 6px 6px 0 #dc0000;
          transform: translate(-1px, -1px);
        }

        .ws-data-card {
          margin-top: 32px;
        }

        .ws-card-head {
          background: #1a1a1a;
          color: #ffffff;
          padding: 10px 16px;
          font-family: 'Anton', sans-serif;
          font-size: 18px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        /* ---------- gallery ---------- */

        .ws-drift-wall-wrap {
          position: relative;
          margin-top: 32px;
          padding: clamp(8px, 1vw, 16px) 0 0;
          overflow: hidden;
        }

        .ws-gallery-web {
          position: absolute;
          z-index: 0;
          pointer-events: none;
          opacity: 0.4;
        }

        .ws-gallery-web--center {
          top: 50%;
          left: 50%;
          width: 260px;
          height: 260px;
          transform: translate(-50%, -50%);
          opacity: 0.28;
        }

        .ws-gallery-web--tl {
          top: -40px;
          left: -40px;
          width: 120px;
          height: 120px;
        }

        .ws-gallery-web--br {
          bottom: -40px;
          right: -40px;
          width: 120px;
          height: 120px;
          transform: rotate(180deg);
        }

        /* ---------- sponsors ---------- */

        .ws-sponsors-grid {
          position: relative;
          z-index: 2;
          width: 100%;
          overflow: hidden;
          margin-top: 32px;
        }

        .ws-sponsors-track {
          display: flex;
          width: max-content;
          animation: ws-sponsors-marquee 18s linear infinite;
          will-change: transform;
        }

        .ws-sponsors-set {
          display: flex;
          flex: 0 0 auto;
          gap: 24px;
          padding-right: 24px;
        }

        .ws-sponsor-card {
          position: relative;
          flex: 0 0 clamp(280px, 28vw, 360px);
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 20px;
          border: 1px solid rgba(220, 0, 0, 0.35);
          border-radius: 16px;
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.55));
          box-shadow:
            0 10px 30px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          overflow: hidden;
          transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
        }

        .ws-sponsor-card::after {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, rgba(220, 0, 0, 0.5), transparent);
          pointer-events: none;
        }

        .ws-sponsor-card:hover,
        .ws-sponsor-card:focus-within {
          transform: translateY(-3px);
          border-color: rgba(220, 0, 0, 0.6);
          box-shadow:
            0 14px 34px rgba(0, 0, 0, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }

        .ws-sponsor-logo {
          display: grid;
          place-items: center;
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 12px;
          overflow: hidden;
          background: #f2f2f2;
        }

        .ws-sponsor-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .ws-sponsor-info {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .ws-sponsor-name {
          margin: 0;
          font-family: 'Anton', sans-serif;
          font-weight: 400;
          font-size: 1.15rem;
          line-height: 1.1;
          letter-spacing: 0.02em;
          color: #b7102a;
          text-transform: uppercase;
        }

        .ws-sponsor-blurb {
          position: relative;
          z-index: 1;
          margin: 0;
          font-family: 'Hanken Grotesk', sans-serif;
          font-size: 0.92rem;
          line-height: 1.5;
          color: #3a3a3a;
          overflow-wrap: break-word;
          word-break: normal;
        }

        @keyframes ws-sponsors-marquee {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        .ws-sponsors-grid:hover .ws-sponsors-track,
        .ws-sponsors-grid:focus-within .ws-sponsors-track {
          animation-play-state: paused;
        }

        /* =========================================================
           RESPONSIVE — tablet (600px+)
        ========================================================= */

        @media (min-width: 600px) {
          .ws-container {
            padding-inline: 32px;
          }

          .ws-sponsors-grid {
            margin-top: 28px;
          }

          .ws-gallery-web--center {
            width: 320px;
            height: 320px;
          }

          .ws-gallery-web--tl,
          .ws-gallery-web--br {
            width: 150px;
            height: 150px;
          }

          .ws-list li {
            padding-inline: 20px 20px 20px 40px;
          }

          .ws-list li::before {
            left: 20px;
          }
        }

        /* =========================================================
           RESPONSIVE — desktop (1024px+)
        ========================================================= */

        @media (min-width: 1024px) {
          .ws-container {
            padding-inline: 64px;
          }

          .ws-hero {
            padding: 128px 0 96px;
          }

          .ws-section {
            padding: 96px 0;
          }

          .ws-sponsors-grid {
            gap: 16px;
          }

          .ws-gallery-web--tl,
          .ws-gallery-web--br {
            width: 180px;
            height: 180px;
          }

          .ws-sponsor-card {
            padding: 24px;
          }

          .ws-data-card {
            margin-top: 40px;
          }

          .ws-list li {
            padding-inline: 24px 24px 24px 44px;
          }

          .ws-list li::before {
            left: 24px;
          }

          .ws-card-head {
            padding: 12px 24px;
            font-size: 20px;
          }
        }

        /* =========================================================
           RESPONSIVE — mobile
        ========================================================= */

        @media (max-width: 560px) {
          .ws-sponsors-grid {
            margin-top: 24px;
          }

          .ws-sponsors-track {
            animation-duration: 18s;
          }

          .ws-sponsors-set {
            gap: 16px;
            padding-right: 16px;
          }

          .ws-sponsor-card {
            padding: 16px;
            flex-basis: min(340px, calc(100vw - 48px));
          }
        }

        /* =========================================================
           REDUCED MOTION
        ========================================================= */

        @media (prefers-reduced-motion: reduce) {
          .ws-card,
          .ws-sponsors-track {
            transition: none;
            animation: none;
          }
        }
      `}</style>
    </>
  );
}
