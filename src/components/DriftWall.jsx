import { useMemo } from "react";
import "./DriftWall.css";

const defaultItems = [
  {
    image:
      "https://res.cloudinary.com/djm8qhle1/image/upload/v1788092006/IMG_2481_pgbib0.jpg",
    title: "REVIBE '24",
  },
  {
    image:
      "https://res.cloudinary.com/djm8qhle1/image/upload/v1788092056/IMG_2819_zgcaav.jpg",
    title: "REVIBE '24",
  },
  {
    image:
      "https://res.cloudinary.com/djm8qhle1/image/upload/v1788092056/IMG_20240427_171249_ztrtka.jpg",
    title: "REVIBE '24",
  },
  {
    image:
      "https://res.cloudinary.com/djm8qhle1/image/upload/v1788092047/IMG_2672_p41z5f.jpg",
    title: "REVIBE '24",
  },
];

export default function DriftWall({
  items = defaultItems,
  columns = 5,
  tileWidth = 200,
  tileHeight = 132,
  gap = 18,
  tilt = 16,
  turn = -14,
  perspective = 1200,
  depth = 120,
  speed = 42,
  direction = "up",
  variance = 0.45,
  parallax = 0.6,
  lift = 64,
  fade = 0.6,
  dim = 0.55,
  overlayColor = "#060010",
  radius = 14,
  roll = 0,
  pauseOnHover = false,
  grayscale = false,
}) {
  const safeItems = Array.isArray(items)
    ? items.filter((item) => item?.image)
    : [];

  const safeColumns = Math.max(
    1,
    Math.min(Number(columns) || 5, 7)
  );

  const lanes = useMemo(() => {
    if (!safeItems.length) return [];

    /*
     * MIRRORED GALLERY ORDER
     *
     * For 12 photos and 2 visible columns:
     *
     * LEFT              RIGHT
     * Photo 1           Photo 12
     * Photo 2           Photo 11
     * Photo 3           Photo 10
     * Photo 4           Photo 9
     * Photo 5           Photo 8
     * Photo 6           Photo 7
     *
     * Even lanes  -> normal order
     * Odd lanes   -> reverse order
     */

    return Array.from({ length: safeColumns }, (_, laneIndex) => {
      const orderedItems =
        laneIndex % 2 === 0
          ? safeItems
          : [...safeItems].reverse();

      const sequence = orderedItems.map((source, cardIndex) => {
        const sign =
          (cardIndex + laneIndex) % 2 === 0 ? -1 : 1;

        return {
          ...source,

          key: `${laneIndex}-${cardIndex}-${source.image}`,

          tilt:
            sign *
            (tilt *
              (0.35 +
                ((cardIndex + laneIndex) % 4) * 0.08)),

          depth:
            ((cardIndex + laneIndex) % 3) - 1,
        };
      });

      /*
       * Duplicate the sequence so the wall can
       * continuously scroll without an empty gap.
       */
      return [...sequence, ...sequence];
    });
  }, [safeItems, safeColumns, tilt]);

  if (!safeItems.length) return null;

  const speedSeconds = Math.max(
    16,
    Number(speed) || 42
  );

  return (
    <div
      className={`ws-drift-wall-shell${
        pauseOnHover
          ? " ws-drift-wall-shell--pause-on-hover"
          : ""
      }`}
      style={{
        "--columns": safeColumns,
        "--mobile-columns": 2,

        "--gap": `${gap}px`,

        "--tile-width": `${tileWidth}px`,
        "--tile-height": `${tileHeight}px`,
        "--tile-ratio": `${tileWidth} / ${tileHeight}`,

        "--tilt": `${tilt}deg`,
        "--turn": `${turn}deg`,

        "--perspective": `${perspective}px`,
        "--depth": `${depth}px`,

        "--speed": `${speedSeconds}s`,

        "--direction":
          direction === "down" ? 1 : -1,

        "--variance": variance,

        "--lift": `${lift}px`,

        "--fade": fade,
        "--dim": dim,

        "--overlay-color": overlayColor,

        "--radius": `${radius}px`,

        "--roll": `${roll}deg`,

        "--parallax": parallax,

        "--grayscale": grayscale ? 1 : 0,
      }}
    >
      <div
        className="ws-drift-wall"
        aria-label="Previous REVIBE gallery wall"
      >
        {lanes.map((lane, laneIndex) => (
          <div
            className={`ws-drift-wall-lane${
              laneIndex % 2
                ? " ws-drift-wall-lane--reverse"
                : ""
            }`}
            key={`lane-${laneIndex}`}
            style={{
              "--lane-speed": `${
                speedSeconds *
                (0.82 +
                  ((laneIndex * 0.13) % 0.42))
              }s`,

              "--lane-delay":
                `${-(laneIndex * 2.15)}s`,

              "--lane-offset":
                `${(laneIndex % 3) * 7}px`,

              "--zigzag":
                `${laneIndex % 2 ? -1 : 1}`,
            }}
          >
            <div className="ws-drift-wall-sequence">
              {lane.map((item, index) => (
                <figure
                  className="ws-drift-wall-card"
                  key={item.key}
                  style={{
                    "--card-tilt":
                      `${item.tilt}deg`,

                    "--card-depth":
                      item.depth,

                    "--card-index":
                      index,
                  }}
                >
                  <div className="ws-drift-wall-image-wrap">
                    <img
                      src={item.image}
                      alt={
                        item.title ||
                        "REVIBE gallery highlight"
                      }
                      loading={
                        index < safeItems.length
                          ? "eager"
                          : "lazy"
                      }
                      decoding="async"
                    />

                    <span
                      className="ws-drift-wall-shine"
                      aria-hidden="true"
                    />
                  </div>

                  {item.title ? (
                    <figcaption>
                      {item.title}
                    </figcaption>
                  ) : null}
                </figure>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        className="ws-drift-wall-vignette"
        aria-hidden="true"
      />
    </div>
  );
}