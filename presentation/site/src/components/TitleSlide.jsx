import { authors } from "../data/attention.js";
import { AmbientField } from "./AmbientField.jsx";

export function TitleSlide() {
  return (
    <section className="slide title-slide-section">
      <div className="slide-ambient">
        <AmbientField density={70} color="140, 130, 255" speed={0.55} />
      </div>
      <div className="slide-content title-slide">
        <p className="kicker">NeurIPS 2017 · Google Brain / Google Research</p>
        <h1>Attention Is All You Need</h1>
        <p className="subtitle">Vaswani et al. — Google Brain / Google Research — NeurIPS 2017</p>
        <div className="author-grid">
          {authors.map((author, index) => (
            <span className="author-chip" style={{ "--i": index }} key={author}>{author}</span>
          ))}
        </div>
        <p className="badge">Equal contribution — author order randomized.</p>
      </div>
    </section>
  );
}
