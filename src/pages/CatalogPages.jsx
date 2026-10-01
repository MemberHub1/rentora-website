import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Search, Share2, SlidersHorizontal } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { categories, familyNames } from "../data/catalog";
import { ColorSwatch, ProductCard, SectionHeader, Button, DataState } from "../components/UI";
import { Seo } from "../components/SiteLayout";
import { catalogRepository } from "../lib/catalogRepository";
import { useCatalogCollection } from "../hooks/useCatalogCollection";

function PageIntro({ eyebrow, title, copy, image, alt }) {
  return <section className={`page-intro ${image ? "page-intro-image" : ""}`}>
    {image && <img className="page-intro-photo" src={image} alt={alt} />}
    <div className="container page-intro-content"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{copy}</p></div>
  </section>;
}

export function ProductsPage() {
  const [query, setQuery] = useState("");
  const [params, setParams] = useSearchParams();
  const { data: items, status, error, reload } = useCatalogCollection("products");
  const { data: categoryItems, status: categoryItemsStatus, error: categoryError, reload: reloadCategories } = useCatalogCollection("categories");
  const category = params.get("category") || "all";
  const filtered = useMemo(() => items.filter((product) => {
    const matchesCategory = category === "all" || product.category === category;
    const matchesQuery = `${product.name} ${product.description} ${product.finish} ${product.category}`.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  }), [category, items, query]);
  const displayProducts = useMemo(() => filtered.map((product) => ({
    ...product,
    categoryName: categoryItems.find((item) => item.id === product.category)?.shortName,
  })), [categoryItems, filtered]);

  return <main>
    <Seo title="Paint collections" description="Explore the COLORA PAINTS collection of interior, exterior, ceiling, wood, metal, primer and waterproofing paints." />
    <PageIntro eyebrow="THE COLORA COLLECTION" title={<>Made for the life<br />happening around you.</>} copy="Thoughtfully made paints, considered finishes, and colors that help make your space feel like home." image="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1700&q=85" alt="Bright modern home with warm neutral wall colors" />
    <section className="catalog-section section-pad"><div className="container">
      <div className="catalog-toolbar"><label className="search-box"><Search size={17} /><span className="visually-hidden">Search products</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a paint or finish…" /></label><span className="result-count">{filtered.length} {filtered.length === 1 ? "product" : "products"}</span></div>
      <div className="filter-strip" aria-label="Filter by paint category"><SlidersHorizontal size={16} />{[{ id: "all", name: "All paints" }, ...(categoryItems.length ? categoryItems : categoryItemsStatus === "preview" ? categories : [])].map((item) => <button type="button" key={item.id} className={category === item.id ? "filter-chip active" : "filter-chip"} onClick={() => setParams(item.id === "all" ? {} : { category: item.id })}>{item.name}</button>)}</div>
      {categoryItemsStatus === "error" && <DataState error={categoryError} onRetry={reloadCategories} label="product categories" />}
      <DataState loading={status === "loading"} error={status === "error" ? error : ""} onRetry={reload} preview={status === "preview"} empty={status === "ready" && items.length === 0} label="paint collections" />
      {status !== "loading" && status !== "error" && (filtered.length ? <div className="product-grid">{displayProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div> : status === "ready" && items.length > 0 ? <div className="empty-state"><Search size={22} /><h2>No paints found</h2><p>Try a different search or choose another collection.</p><button className="text-link" type="button" onClick={() => { setQuery(""); setParams({}); }}>Clear filters <ArrowRight size={15} /></button></div> : null)}
    </div></section>
  </main>;
}

export function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [categoriesForProduct, setCategoriesForProduct] = useState([]);
  const [related, setRelated] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    Promise.all([catalogRepository.getById("products", id), catalogRepository.getAll("products"), catalogRepository.getAll("categories")]).then(([item, all, categoryList]) => {
      if (!active) return;
      setProduct(item);
      setCategoriesForProduct(categoryList);
      setRelated(all.filter((entry) => entry.category === item?.category && entry.id !== item.id).slice(0, 3).map((entry) => ({
        ...entry,
        categoryName: categoryList.find((categoryItem) => categoryItem.id === entry.category)?.shortName,
      })));
      setStatus("ready");
    }).catch((loadError) => {
      console.error("Unable to load product details.", loadError);
      if (active) { setError(loadError instanceof Error ? loadError.message : "Unable to load this product."); setStatus("error"); }
    });
    return () => { active = false; };
  }, [id]);
  if (status === "loading") return <main className="container page-loading"><DataState loading label="paint details" /></main>;
  if (status === "error") return <main className="container page-loading"><DataState error={error} onRetry={() => window.location.reload()} label="paint details" /></main>;
  if (!product) return <NotFound type="paint" />;
  const category = categoriesForProduct.find((item) => item.id === product.category);
  return <main>
    <Seo title={product.name} description={product.description} image={product.image || undefined} />
    <section className="detail-section section-pad"><div className="container">
      <Link className="back-link" to="/products"><ArrowLeft size={15} /> All paints</Link>
      <div className="product-detail-grid">
        <div className="detail-image"><img src={product.image} alt={`${product.name} paint inspiration`} /><span>{category?.name}</span></div>
        <div className="product-detail-copy"><span className="eyebrow">{category?.name}</span><h1>{product.name}</h1><p className="detail-lead">{product.description}</p><div className="detail-attributes"><div><span>Finish</span><strong>{product.finish}</strong></div><div><span>Available sizes</span><strong>{product.sizes.join(" · ")}</strong></div></div><h2>Made for your home</h2><ul className="detail-feature-list">{product.features.map((feature) => <li key={feature}><Check size={15} />{feature}</li>)}</ul><div className="usage-note"><span>RECOMMENDED USE</span><p>{product.usage}</p></div><Button to="/contact">Ask about this paint <ArrowRight size={16} /></Button><p className="product-detail-note">For current availability, pricing and technical guidance, please enquire with our team.</p></div>
      </div>
    </div></section>
    {related.length > 0 && <section className="related-section section-pad"><div className="container"><div className="section-heading-row"><SectionHeader eyebrow="KEEP EXPLORING" title="More from this collection." /><Link className="text-link" to="/products">View all paints <ArrowRight size={15} /></Link></div><div className="product-grid">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div></div></section>}
  </main>;
}

export function ColorsPage() {
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("All colors");
  const { data: colors, status, error, reload } = useCatalogCollection("colors");
  const filtered = useMemo(() => colors.filter((color) =>
    (family === "All colors" || color.family === family) &&
    `${color.name} ${color.code} ${color.family}`.toLowerCase().includes(query.toLowerCase())
  ), [colors, family, query]);
  return <main>
    <Seo title="Explore our colors" description="Discover the COLORA color library. Search and explore paint shades by color family and finish." />
    <PageIntro eyebrow="COLOR, IN EVERY LIGHT" title={<>A color story<br /><em>all your own.</em></>} copy="Meet the colors that bring a room together. Find your shade, then imagine what it could become." image="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1700&q=85" alt="Warm interior with natural textures and a calm green palette" />
    <section className="colors-gallery-section section-pad"><div className="container">
      <div className="color-gallery-head"><SectionHeader eyebrow="THE COLORA PALETTE" title="Find your starting point." description="Every shade has a little story. Choose the one that speaks to yours." /><label className="search-box"><Search size={17} /><span className="visually-hidden">Search colors</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search colors or codes…" /></label></div>
      <div className="family-filters" aria-label="Filter by color family">{familyNames.map((name) => <button key={name} type="button" className={`family-filter ${family === name ? "active" : ""}`} onClick={() => setFamily(name)}>{name}</button>)}</div>
      <DataState loading={status === "loading"} error={status === "error" ? error : ""} onRetry={reload} preview={status === "preview"} empty={status === "ready" && colors.length === 0} label="colors" />
      {status !== "loading" && status !== "error" && (filtered.length ? <div className="color-gallery">{filtered.map((color) => <Link className="color-tile" to={`/colors/${color.id}`} key={color.id}><span className="color-tile-swatch" style={{ backgroundColor: color.hex }} /><span className="color-tile-info"><strong>{color.name}</strong><span>{color.code} <i /> {color.family} <i /> {color.finish}</span></span><ArrowUpRight className="color-tile-arrow" size={15} /></Link>)}</div> : status === "ready" && colors.length > 0 ? <div className="empty-state"><h2>No colors found</h2><p>Try another shade, code or color family.</p><button className="text-link" type="button" onClick={() => { setQuery(""); setFamily("All colors"); }}>Clear filters <ArrowRight size={15} /></button></div> : null)}
      <p className="color-light-note">Colors shown are a digital guide. The appearance of a shade can vary with lighting, screen settings and surface.</p>
    </div></section>
  </main>;
}

export function ColorDetailPage() {
  const { id } = useParams();
  const [color, setColor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [nearby, setNearby] = useState([]);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  useEffect(() => {
    let active = true;
    Promise.all([catalogRepository.getById("colors", id), catalogRepository.getAll("colors")]).then(([item, all]) => {
      if (!active) return;
      setColor(item);
      setNearby(all.filter((entry) => entry.family === item?.family && entry.id !== item.id).slice(0, 5));
      setLoading(false);
    }).catch((error) => {
      console.error("Unable to load color details.", error);
      if (active) { setLoadError(error instanceof Error ? error.message : "Unable to load this color."); setLoading(false); }
    });
    return () => { active = false; };
  }, [id]);
  if (loading) return <main className="container page-loading"><DataState loading label="color details" /></main>;
  if (loadError) return <main className="container page-loading"><DataState error={loadError} onRetry={() => window.location.reload()} label="color details" /></main>;
  if (!color) return <NotFound type="color" />;
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(color.code);
      setCopied(true);
      setCopyError("");
    } catch {
      setCopied(false);
      setCopyError("Clipboard access is unavailable in this browser.");
    }
  };
  return <main>
    <Seo title={`${color.name} paint color`} description={`Explore ${color.name}, COLORA color ${color.code}. See its family and recommended finish.`} image={color.image || undefined} />
    <section className="color-detail-section section-pad"><div className="container">
      <Link className="back-link" to="/colors"><ArrowLeft size={15} /> All colors</Link>
      <div className="color-detail-grid"><div className="color-detail-swatch" style={{ backgroundColor: color.hex }}>{color.image && <img src={color.image} alt={`${color.name} color inspiration`} />}<span>{color.code}</span></div><div className="color-detail-copy"><span className="eyebrow">{color.family.toUpperCase()} · THE COLORA PALETTE</span><h1>{color.name}</h1><p className="detail-lead">A thoughtful, quietly distinctive {color.family.toLowerCase()} with a character all its own. Picture it in morning light, then see how it feels in your space.</p><div className="color-code-card"><span>COLOR CODE</span><strong>{color.code}</strong><button className="text-link" type="button" onClick={copyCode}><Share2 size={15} /> {copied ? "Copied" : "Copy code"}</button></div>{copyError && <p className="form-error" role="alert">{copyError}</p>}<div className="detail-attributes"><div><span>Color family</span><strong>{color.family}</strong></div><div><span>Suggested finish</span><strong>{color.finish}</strong></div></div><Button to="/contact">Ask about this color <ArrowRight size={16} /></Button><p className="product-detail-note">Visit a paint specialist for a physical sample and finish recommendations.</p></div></div>
      {nearby.length > 0 && <div className="nearby-colors"><SectionHeader eyebrow={`MORE FROM ${color.family.toUpperCase()}`} title="Colors that feel at home together." /><div className="nearby-swatches">{nearby.map((item) => <ColorSwatch key={item.id} color={item} />)}</div></div>}
    </div></section>
  </main>;
}

function NotFound({ type }) {
  return <main className="not-found container"><span className="eyebrow">NOT FOUND</span><h1>We couldn’t find that {type}.</h1><p>It may have moved, or perhaps the shade is still being mixed.</p><Button to={type === "paint" ? "/products" : "/colors"} variant="outline">Go back <ArrowRight size={15} /></Button></main>;
}
