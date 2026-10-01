import { useState } from "react";
import { ArrowRight, Check, PaintBucket } from "lucide-react";
import { Link } from "react-router-dom";
import { categories } from "../data/catalog";
import { catalogRepository } from "../lib/catalogRepository";

export function Button({ children, to, variant = "dark", className = "", ...props }) {
  const classes = `button button-${variant} ${className}`.trim();
  return to
    ? <Link className={classes} to={to} {...props}>{children}</Link>
    : <button className={classes} {...props}>{children}</button>;
}

export function SectionHeader({ eyebrow, title, description, align = "left" }) {
  return <div className={`section-heading align-${align}`}>
    {eyebrow && <span className="eyebrow">{eyebrow}</span>}
    <h2>{title}</h2>
    {description && <p>{description}</p>}
  </div>;
}

export function DataState({ loading, error, onRetry, preview = false, empty = false, label = "content" }) {
  if (loading) return <div className="data-state" role="status"><span className="loading-indicator" />Loading {label}…</div>;
  if (error) return <div className="data-state data-state-error" role="alert"><strong>We couldn’t load {label}.</strong><span>{error}</span>{onRetry && <button className="text-link" type="button" onClick={onRetry}>Try again <ArrowRight size={15} /></button>}</div>;
  if (preview) return <div className="preview-state" role="status">Preview catalog · Connect Supabase to load live, published content.</div>;
  if (empty) return <div className="data-state">No {label} are available yet.</div>;
  return null;
}

export function ProductCard({ product }) {
  return <article className="product-card">
    <Link className="product-image-wrap" to={`/products/${product.id}`}>
      <img src={product.image} alt={`${product.name} paint in a finished interior`} loading="lazy" />
      <span className="product-category">{product.categoryName ?? categories.find((item) => item.id === product.category)?.shortName ?? product.category}</span>
      <span className="product-open" aria-hidden="true"><ArrowRight size={17} /></span>
    </Link>
    <div className="product-card-body">
      <div><h3><Link to={`/products/${product.id}`}>{product.name}</Link></h3><p>{product.description}</p></div>
      <div className="product-meta"><span>{product.finish} finish</span><span>{product.sizes.slice(0, 2).join(" · ")}</span></div>
    </div>
  </article>;
}

export function ColorSwatch({ color, onClick, selected = false, compact = false }) {
  const content = <>
    <span className="swatch-chip" style={{ "--swatch": color.hex }} aria-hidden="true" />
    {!compact && <span className="swatch-copy"><strong>{color.name}</strong><small>{color.code}</small></span>}
  </>;
  return onClick
    ? <button className={`swatch ${selected ? "selected" : ""} ${compact ? "swatch-compact" : ""}`} onClick={onClick} type="button" aria-label={`${color.name}, ${color.code}`} aria-pressed={selected}>{content}</button>
    : <Link className={`swatch ${compact ? "swatch-compact" : ""}`} to={`/colors/${color.id}`} aria-label={`${color.name}, ${color.code}`}>{content}</Link>;
}

export function PaintCalculator({ compact = false }) {
  const [inputs, setInputs] = useState({ length: "", width: "", height: "", doors: "1", windows: "1", coats: "2" });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const update = (event) => setInputs((current) => ({ ...current, [event.target.name]: event.target.value }));

  const calculate = (event) => {
    event.preventDefault();
    const length = Number(inputs.length);
    const width = Number(inputs.width);
    const height = Number(inputs.height);
    const doors = Number(inputs.doors);
    const windows = Number(inputs.windows);
    const coats = Number(inputs.coats);
    if (![length, width, height].every((value) => Number.isFinite(value) && value > 0) ||
        ![doors, windows, coats].every((value) => Number.isInteger(value) && value >= 0) || coats < 1) {
      setError("Enter positive room dimensions and valid whole numbers for openings and coats.");
      setResult(null);
      return;
    }
    const wallArea = 2 * (length + width) * height;
    const paintableArea = Math.max(0, wallArea - doors * 1.9 * 0.85 - windows * 1.2 * 1.2);
    const liters = Math.ceil((paintableArea * coats / 10) * 10) / 10;
    setError("");
    setResult({ wallArea, paintableArea, liters, cans: Math.ceil(liters / 2.5) });
  };

  return <div className={`calculator-panel ${compact ? "calculator-compact" : ""}`}>
    <form className="calculator-form" onSubmit={calculate}>
      <div className="calculator-fields">
        <label>Room length <span>(m)</span><input name="length" type="number" min="0.1" step="0.1" placeholder="e.g. 4.5" value={inputs.length} onChange={update} required /></label>
        <label>Room width <span>(m)</span><input name="width" type="number" min="0.1" step="0.1" placeholder="e.g. 3.8" value={inputs.width} onChange={update} required /></label>
        <label>Wall height <span>(m)</span><input name="height" type="number" min="0.1" step="0.1" placeholder="e.g. 2.6" value={inputs.height} onChange={update} required /></label>
        <label>Doors<input name="doors" type="number" min="0" step="1" value={inputs.doors} onChange={update} required /></label>
        <label>Windows<input name="windows" type="number" min="0" step="1" value={inputs.windows} onChange={update} required /></label>
        <label>Number of coats<select name="coats" value={inputs.coats} onChange={update}><option value="1">1 coat</option><option value="2">2 coats</option><option value="3">3 coats</option></select></label>
      </div>
      <button className="button button-dark" type="submit"><PaintBucket size={16} /> Calculate paint required</button>
      <p className="calculator-caveat">An estimate based on 10 m² per litre per coat. Surface texture and product coverage may vary.</p>
      {error && <p className="form-error" role="alert">{error}</p>}
    </form>
    {result && <div className="calculator-result" role="status">
      <div className="result-primary"><span>Estimated paint needed</span><strong>{result.liters} <small>L</small></strong><span>about {result.cans} × 2.5 L {result.cans === 1 ? "can" : "cans"}</span></div>
      <div className="result-stats"><div><span>Total wall area</span><strong>{result.wallArea.toFixed(1)} m²</strong></div><div><span>Paintable area</span><strong>{result.paintableArea.toFixed(1)} m²</strong></div></div>
      <Link className="text-link" to="/products">Explore suitable paints <ArrowRight size={15} /></Link>
    </div>}
  </div>;
}

export function QuoteForm({ compact = false }) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setSubmitting(true);
    try {
      await catalogRepository.createEnquiry(data);
      setError("");
      setSubmitted(true);
      event.currentTarget.reset();
    } catch (submissionError) {
      console.error("Unable to submit enquiry.", submissionError);
      setError(submissionError instanceof Error ? submissionError.message : "We couldn’t submit your enquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) return <div className="success-state" role="status"><span className="success-icon"><Check size={22} /></span><div><h3>Thanks for getting in touch.</h3><p>Your enquiry has been received. Our team will be in touch.</p><button className="text-link" onClick={() => setSubmitted(false)} type="button">Send another enquiry <ArrowRight size={15} /></button></div></div>;

  return <form className={`quote-form ${compact ? "quote-form-compact" : ""}`} onSubmit={submit}>
    <div className="form-row"><label>Your name<input name="name" autoComplete="name" placeholder="Name" required /></label><label>Phone number<input name="phone" type="tel" autoComplete="tel" placeholder="+1 555 000 0000" required /></label></div>
    <div className="form-row"><label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" /></label><label>City<input name="city" autoComplete="address-level2" placeholder="Your city" /></label></div>
    <label>What are you painting?<select name="interest" defaultValue=""><option value="" disabled>Select a product or project</option><option>Interior walls</option><option>Exterior walls</option><option>Wood or metal</option><option>Waterproofing</option><option>Color consultation</option><option>Other project</option></select></label>
    <label>Tell us a little about your project<textarea name="message" rows="4" placeholder="Rooms, surfaces, colors or anything else we should know…" required /></label>
    <button className="button button-dark" type="submit" disabled={submitting || !catalogRepository.isConfigured}>{submitting ? "Submitting…" : "Submit enquiry"} {!submitting && <ArrowRight size={16} />}</button>
    {error && <p className="form-error" role="alert">{error}</p>}
    {!catalogRepository.isConfigured && <p className="form-note" role="status">Contact form is unavailable until Supabase is configured. Your details will not be stored.</p>}
  </form>;
}
