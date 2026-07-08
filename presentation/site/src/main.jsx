import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ArchitectureSlide } from "./components/ArchitectureSlide.jsx";
import { AttentionSlide } from "./components/AttentionSlide.jsx";
import { LiveDemoSlide } from "./components/LiveDemoSlide.jsx";
import { ProblemSlide } from "./components/ProblemSlide.jsx";
import { ResultsSlide } from "./components/ResultsSlide.jsx";
import { TitleSlide } from "./components/TitleSlide.jsx";
import "./styles.css";

const SLIDES = [TitleSlide, ProblemSlide, AttentionSlide, ArchitectureSlide, ResultsSlide, LiveDemoSlide];
const PRESENTERS = ["P1", "P1", "P2", "P3", "P4", "BONUS"];

function App() {
  const [slide, setSlide] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const go = (next) => setSlide(Math.min(SLIDES.length - 1, Math.max(0, next)));

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      document.documentElement.requestFullscreen?.();
    }
  };

  useEffect(() => {
    const onKey = (event) => {
      if (["ArrowRight", "PageDown", " "].includes(event.key)) go(slide + 1);
      if (["ArrowLeft", "PageUp"].includes(event.key)) go(slide - 1);
      if (/^[1-6]$/.test(event.key)) go(Number(event.key) - 1);
      if (event.key === "f" || event.key === "F") toggleFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slide]);

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const Slide = SLIDES[slide];

  return (
    <main className="deck">
      <div className="slide-shell" key={slide}>
        <Slide />
      </div>
      <footer className="deck-footer">
        <button aria-label="Previous slide" onClick={() => go(slide - 1)}>&#8249;</button>
        <div className="progress"><span style={{ width: `${((slide + 1) / SLIDES.length) * 100}%` }} /></div>
        <span>{slide + 1} / {SLIDES.length}</span>
        <strong>{PRESENTERS[slide]}</strong>
        <button
          className="present-btn"
          aria-label={fullscreen ? "Exit presenter mode" : "Enter presenter mode"}
          title={fullscreen ? "Exit full screen (F)" : "Present full screen (F)"}
          onClick={toggleFullscreen}
        >
          {fullscreen ? "\u2715" : "\u26F6"}
        </button>
        <button aria-label="Next slide" onClick={() => go(slide + 1)}>&#8250;</button>
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
