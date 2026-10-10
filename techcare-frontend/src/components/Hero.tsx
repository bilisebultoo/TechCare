import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const changingWords = [
  "solutions",
  "support",
  "answers",
  "service",
  "results",
];

function Hero() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((current) => {
        return (current + 1) % changingWords.length;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero">

      {/* LEFT SIDE */}
      <div className="hero-content">

        <div className="hero-small-label">
          PROFESSIONAL HARDWARE SUPPORT
        </div>

        <h1>
          Where hardware problems
          <br />
          turn into{" "}
          <span className="changing-word">
            {changingWords[wordIndex]}
          </span>
        </h1>

        <p className="hero-description">
          Fast, reliable and professional hardware support
          for laptops, desktops, printers, mobile devices
          and network equipment.
        </p>

        <div className="hero-buttons">

          <Link
            to="/login"
            className="hero-primary-btn"
          >
            Report a Problem
            <span>→</span>
          </Link>

          <a
            href="#about"
            className="hero-secondary-btn"
          >
            Learn More
          </a>

        </div>

      </div>

      {/* RIGHT SIDE - ANIMATED COLORS */}
      <div className="hero-visual">

        <div className="hero-visual-background">

          <div className="color-blob blob-one"></div>

          <div className="color-blob blob-two"></div>

          <div className="color-blob blob-three"></div>

          <div className="color-blob blob-four"></div>

          <div className="hero-grid"></div>

        </div>

      </div>

    </section>
  );
}

export default Hero;