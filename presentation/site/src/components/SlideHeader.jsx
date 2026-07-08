export function SlideHeader({ eyebrow, title }) {
  return (
    <header className="slide-header">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
    </header>
  );
}
