import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, BadgeCheck, Brush, Droplets, ShieldCheck, Sparkles, Sun, Upload, X } from "lucide-react";
import { Link } from "react-router-dom";
import { categories } from "../data/catalog";
import { Button, ColorSwatch, PaintCalculator, SectionHeader } from "../components/UI";
import { Seo } from "../components/SiteLayout";
import { catalogRepository } from "../lib/catalogRepository";
import { useCatalogCollection } from "../hooks/useCatalogCollection";
import { defaultSettings } from "../data/catalog";

const sellingPoints = [
  { title: "Made with care", text: "Thoughtful formulas and considered color, made to feel right at home.", icon: BadgeCheck },
  { title: "Color that stays", text: "Beautiful, dependable finishes designed for the everyday.", icon: ShieldCheck },
  { title: "A little more protection", text: "Reliable surface protection, indoors and out.", icon: Droplets },
  { title: "Easy everyday living", text: "Wipeable, practical finishes that make life a little simpler.", icon: Brush },
];

function Visualizer({ colors }) {
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState("");
  const [selectedShadeId, setSelectedShadeId] = useState(null);
  const shade = colors.find((color) => color.id === selectedShadeId) ?? colors.find((color) => color.id === "sage-leaf") ?? colors[0] ?? { id: "preview-default", name: "Sage Leaf", code: "C-305", hex: "#A5AC8F" };
  const [uploadError, setUploadError] = useState("");
  const inputRef = useRef(null);
  const modalRef = useRef(null);
  useEffect(() => () => { if (image) URL.revokeObjectURL(image); }, [image]);
  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    modalRef.current?.querySelector("button")?.focus();
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [open]);
  const upload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Choose a valid image file.");
      event.target.value = "";
      return;
    }
    if (file.size > 8_000_000) {
      setUploadError("Choose an image smaller than 8 MB.");
      event.target.value = "";
      return;
    }
    setUploadError("");
    setImage(URL.createObjectURL(file));
  };
  return <section className="visualizer-section section-pad">
    <div className="container visualizer-grid">
      <div className="visualizer-copy">
        <span className="eyebrow eyebrow-light">Your walls, your way</span>
        <h2>See Your Room<br />in a New Color.</h2>
        <p>Bring your favorite shade home before you pick up a brush. Upload a room photo, explore a few colors and find the feeling that fits.</p>
        <button className="button button-cream" type="button" disabled={!colors.length} onClick={() => setOpen(true)}>Try color visualizer <ArrowUpRight size={16} /></button>
        <span className="visualizer-note"><Sparkles size={14} />{colors.length ? "A first-look preview. Full room visualization is coming soon." : "Add colors to the catalog to enable the preview."}</span>
      </div>
      <div className="visualizer-photo">
        <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1100&q=85" alt="Sunlit living room with a softly painted feature wall" loading="lazy" />
        <span className="photo-caption"><Sun size={15} /> A room, reimagined in {shade.name}</span>
        <div className="photo-swatches">{colors.slice(0, 5).map((color) => <ColorSwatch key={color.id} color={color} compact />)}</div>
      </div>
    </div>
    {open && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section ref={modalRef} className="visualizer-modal" role="dialog" aria-modal="true" aria-labelledby="visualizer-title" tabIndex={-1}>
        <div className="modal-header"><div><span className="eyebrow">Color preview</span><h2 id="visualizer-title">A new point of view.</h2></div><button className="icon-button" type="button" aria-label="Close color preview" onClick={() => setOpen(false)}><X size={20} /></button></div>
        <div className="visualizer-workspace">
          <div className="visualizer-canvas" style={{ backgroundColor: shade.hex }}>
            {image ? <img src={image} alt="Your uploaded room for color exploration" /> : <div className="visualizer-empty"><Upload size={24} /><strong>Your room goes here</strong><span>Upload a photo to begin exploring</span><button className="button button-outline" type="button" onClick={() => inputRef.current?.click()}>Choose a room photo</button></div>}
            {image && <div className="preview-tint" style={{ backgroundColor: shade.hex }} aria-label={`Color overlay preview: ${shade.name}`} />}
          </div>
          <div className="visualizer-controls">
            <div><strong>Try a color</strong><span>{shade.name} · {shade.code}</span></div>
            <div className="modal-swatches">{colors.map((color) => <ColorSwatch key={color.id} color={color} compact selected={shade.id === color.id} onClick={() => setSelectedShadeId(color.id)} />)}</div>
            <button className="button button-outline upload-again" type="button" onClick={() => inputRef.current?.click()}><Upload size={15} /> {image ? "Choose another image" : "Upload a room photo"}</button>
            <input ref={inputRef} className="visually-hidden" type="file" accept="image/*" onChange={upload} />
            {uploadError && <p className="form-error" role="alert">{uploadError}</p>}
            <p>This early preview applies one color overlay to your image. It doesn’t yet identify walls or represent a final paint match.</p>
          </div>
        </div>
      </section>
    </div>}
  </section>;
}

export default function HomePage() {
  const colorQuery = useCatalogCollection("colors");
  const categoryQuery = useCatalogCollection("categories");
  const paintColors = colorQuery.data;
  const [settings, setSettings] = useState(defaultSettings);
  useEffect(() => {
    let active = true;
    catalogRepository.getSettings().then((value) => { if (active) setSettings(value); }).catch((error) => {
      console.error("Unable to load homepage settings.", error);
    });
    const syncSettings = (event) => setSettings(event.detail);
    window.addEventListener("colora:settings-updated", syncSettings);
    return () => {
      active = false;
      window.removeEventListener("colora:settings-updated", syncSettings);
    };
  }, []);
  const displayCategories = categoryQuery.status === "preview" ? categories : categoryQuery.data;
  const featuredColor = paintColors.find((color) => color.id === "sage-leaf") ?? paintColors[0];
  return <>
    <Seo title="Premium paints for considered living" description="Explore thoughtful paint collections and lasting color by COLORA PAINTS. Find your shade, estimate your paint and request a project quote." image={settings.heroImage || undefined} />
    <main>
      <section className="hero container">
        <div className="hero-copy">
          <span className="eyebrow"><span className="eyebrow-line" /> COLOR, CONSIDERED</span>
          <h1>Transform Your Space With the <em>Perfect Color</em></h1>
          <p>Premium paints designed to bring lasting beauty, protection and personality to every space.</p>
          <div className="hero-actions"><Button to="/colors">Explore colors <ArrowRight size={16} /></Button><Button to="/contact" variant="outline">Get a quote <ArrowUpRight size={15} /></Button></div>
          <div className="hero-footnote"><span className="hero-dots"><i /><i /><i /></span> Find the shade that feels like you</div>
        </div>
        <div className="hero-image">
          <img src={settings.heroImage || "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1700&q=90"} alt="Calm, sunlit modern living room with natural textures and soft neutral paint" fetchPriority="high" />
          <div className="hero-image-tag"><span className="tag-dot" /><span><strong>Sunday linen</strong><small>A softer kind of white</small></span><span className="tag-swatch" /></div>
          <span className="hero-image-index">01 / 04</span>
        </div>
        <a className="hero-scroll" href="#collections"><ArrowDown size={14} /> DISCOVER COLORA</a>
      </section>

      <section className="collection-section section-pad" id="collections">
        <div className="container">
          <div className="section-heading-row"><SectionHeader eyebrow="THE COLORA EDIT" title="Good paint, for every room." description="The right finish makes a room feel like yours. Start with a collection made for the way you live." /><Link className="text-link" to="/products">Explore all paints <ArrowRight size={15} /></Link></div>
          {categoryQuery.status === "error" && <div className="public-data-warning" role="alert">Paint collections could not be refreshed. Showing the starter collection. {categoryQuery.error}</div>}
          <div className="category-grid">{displayCategories.slice(0, 4).map((category, index) => <Link className={`category-card category-card-${index + 1}`} key={category.id} to={`/products?category=${category.id}`}>
            <img src={category.image} alt={`${category.shortName} paint inspiration`} loading="lazy" />
            <span className="category-number">0{index + 1}</span>
            <div className="category-overlay"><span>{category.shortName.toUpperCase()}</span><h3>{category.name}</h3><p>{category.description}</p><span className="category-link">View collection <ArrowRight size={14} /></span></div>
          </Link>)}</div>
          <div className="category-text-links">{displayCategories.slice(4).map((category) => <Link key={category.id} to={`/products?category=${category.id}`}>{category.name}<ArrowUpRight size={14} /></Link>)}</div>
        </div>
      </section>

      {colorQuery.status === "error" && <div className="container public-data-warning" role="alert">The color library could not be refreshed. {colorQuery.error}</div>}
      {featuredColor && <section className="color-edit-section section-pad">
        <div className="container color-edit-grid">
          <div className="color-edit-intro"><span className="eyebrow">A PALETTE TO COME HOME TO</span><h2>Find the color<br />that feels <em>like you.</em></h2><p>From the quietest whites to the colors that stay with you, find a palette made to bring your space to life.</p><Link className="text-link" to="/colors">Explore the full color library <ArrowRight size={15} /></Link></div>
          <div className="color-feature">
            <div className="featured-color" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1100&q=85)" }}>
              <div className="featured-color-chip" style={{ backgroundColor: featuredColor.hex }} /><div className="featured-color-label"><span>COLOR OF THE MOMENT</span><strong>{featuredColor.name}</strong><small>{featuredColor.code} · a grounded, gentle color</small></div>
            </div>
            <div className="color-family-row">{paintColors.slice(0, 6).map((color) => <ColorSwatch key={color.id} color={color} compact />)}</div>
          </div>
        </div>
      </section>}

      <section className="why-section section-pad"><div className="container"><SectionHeader eyebrow="THE COLORA DIFFERENCE" title="A little more care in every coat." description="It’s the details that make a finish feel just right — considered from the very first brushstroke." align="center" /><div className="feature-grid">{sellingPoints.map(({ title, text, icon: Icon }, index) => <article className="feature-card" key={title}><span className="feature-index">0{index + 1}</span><span className="feature-icon"><Icon size={20} strokeWidth={1.6} /></span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>

      <section className="calculator-preview-section section-pad"><div className="container calculator-preview-grid"><div className="calculator-preview-copy"><span className="eyebrow">A GOOD PLACE TO START</span><h2>How much paint<br />do you <em>need?</em></h2><p>Take the guesswork out of your next project. A few room measurements give you a useful starting estimate.</p><span className="calculator-tip"><span>01</span> Measure your room <span>02</span> Pick your coats <span>03</span> Get an estimate</span></div><PaintCalculator compact /></div></section>

      <Visualizer colors={paintColors} />

      <section className="stats-section"><div className="container stats-inner"><div className="stats-intro"><span className="eyebrow">MADE TO MAKE A DIFFERENCE</span><h2>Good color has a way of <em>staying with you.</em></h2></div><div className="stat-cards"><div><strong>{settings.yearsExperience}</strong><span>years of experience</span></div><div><strong>{settings.happyCustomers}</strong><span>happy customers</span></div><div><strong>{settings.productRange}</strong><span>products in our range</span></div><div><strong>{settings.citiesServed}</strong><span>cities served</span></div></div></div><span className="placeholder-label stats-note">Business metrics are managed from admin settings.</span></section>

      <section className="cta-section section-pad"><div className="cta-inner container"><div><span className="eyebrow eyebrow-light">A FRESH COAT, A FRESH START</span><h2>Ready to Transform<br />Your Space?</h2><p>Tell us what you have in mind. We’d love to help you find your color.</p></div><div className="cta-actions"><Button to="/contact" variant="cream">Get a quote <ArrowRight size={16} /></Button><Link to="/contact">Contact us <ArrowUpRight size={15} /></Link></div><span className="cta-flower" aria-hidden="true">✳</span></div></section>
    </main>
  </>;
}
