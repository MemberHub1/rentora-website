import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ArrowUpRight, Camera, MessageCircle, Music2, AtSign, Menu, X } from "lucide-react";
import { catalogRepository } from "../lib/catalogRepository";
import { categories as sampleCategories, defaultSettings } from "../data/catalog";
import { useCatalogCollection } from "../hooks/useCatalogCollection";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/colors", label: "Colors" },
  { to: "/calculator", label: "Calculator" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Seo({ title, description, image = "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&h=630&q=85" }) {
  useEffect(() => {
    document.title = `${title} | COLORA PAINTS`;
    const ensureMeta = (selector, attributes, content) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement("meta");
        Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };
    ensureMeta('meta[name="description"]', { name: "description" }, description);
    ensureMeta('meta[property="og:title"]', { property: "og:title" }, `${title} | COLORA PAINTS`);
    ensureMeta('meta[property="og:description"]', { property: "og:description" }, description);
    ensureMeta('meta[property="og:type"]', { property: "og:type" }, "website");
    ensureMeta('meta[property="og:url"]', { property: "og:url" }, window.location.href);
    ensureMeta('meta[property="og:image"]', { property: "og:image" }, image);
  }, [description, image, title]);
  return null;
}

export default function SiteLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [settings, setSettings] = useState(defaultSettings);
  const [settingsError, setSettingsError] = useState("");
  const location = useLocation();
  const categoryQuery = useCatalogCollection("categories");
  useEffect(() => {
    const syncSettings = (event) => setSettings(event.detail);
    window.addEventListener("colora:settings-updated", syncSettings);
    return () => window.removeEventListener("colora:settings-updated", syncSettings);
  }, []);
  const closeMenu = () => setMenuOpen(false);
  const displayedCategories = categoryQuery.status === "preview" ? sampleCategories : categoryQuery.data;

  useEffect(() => {
    let active = true;
    catalogRepository.getSettings().then((value) => {
      if (active) setSettings(value);
    }).catch((error) => {
      console.error("Unable to load website settings.", error);
      if (active) setSettingsError(error instanceof Error ? error.message : "Unable to load website settings.");
    });
    return () => { active = false; };
  }, []);

  return (
    <div className="site-shell">
      <div className="announcement">
        <span>Thoughtfully made color for the spaces you love</span>
        <Link to="/colors" onClick={closeMenu}>Find your shade <ArrowUpRight size={13} /></Link>
      </div>
      {!catalogRepository.isConfigured && <div className="preview-state site-preview-state" role="status">Preview mode · Public catalog is sample data. Configure Supabase to show live content and accept enquiries.</div>}
      <header className="site-header">
        <div className="header-inner container">
          <Link className="brand" to="/" aria-label="COLORA PAINTS home" onClick={closeMenu}>
            <span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span>
            <span className="brand-word">{settings.companyName || "COLORA PAINTS"}</span>
          </Link>
          <button className="menu-toggle icon-button" type="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
          <nav className={`main-nav ${menuOpen ? "is-open" : ""}`} aria-label="Main navigation">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === "/"} onClick={closeMenu} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                {item.label}
              </NavLink>
            ))}
            <Link className="button button-dark nav-quote" to="/contact" onClick={closeMenu}>Get a Quote <ArrowUpRight size={15} /></Link>
          </nav>
        </div>
      </header>
      {location.pathname === "/admin" && !catalogRepository.isConfigured && <div className="local-banner">Supabase is not configured. Admin sign-in and content management are unavailable until backend setup is complete.</div>}
      {settingsError && location.pathname !== "/admin" && <div className="public-data-warning" role="status">Some website information could not be loaded. <span>{settingsError}</span></div>}
      <Outlet />
      <Footer settings={settings} categories={displayedCategories} categoriesError={categoryQuery.error} />
    </div>
  );
}

function Footer({ settings, categories, categoriesError }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand-block">
            <Link className="brand brand-light" to="/">
              <span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span>
              <span className="brand-word">{settings.companyName || "COLORA PAINTS"}</span>
            </Link>
            <p>{settings.tagline}</p>
            <div className="footer-social-links" aria-label="Social media links">
              {settings.facebookUrl && <a className="footer-social" href={settings.facebookUrl} target="_blank" rel="noreferrer" aria-label="Facebook"><AtSign size={15} /></a>}
              {settings.instagramUrl && <a className="footer-social" href={settings.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram"><Camera size={15} /></a>}
              {settings.tiktokUrl && <a className="footer-social" href={settings.tiktokUrl} target="_blank" rel="noreferrer" aria-label="TikTok"><Music2 size={15} /></a>}
              <a className="footer-social" href={`https://wa.me/${(settings.whatsapp || settings.phone).replace(/\D/g, "")}`} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={15} /></a>
            </div>
            <span className="placeholder-label">{settings.facebookUrl || settings.instagramUrl || settings.tiktokUrl ? `Follow ${settings.companyName || "COLORA PAINTS"}` : "Social profile links are not configured"}</span>
          </div>
          <div className="footer-column"><h3>Explore</h3>{navItems.map((item) => <Link key={item.to} to={item.to}>{item.label}</Link>)}</div>
          <div className="footer-column"><h3>Our collections</h3>{categoriesError ? <span className="placeholder-label">Collections are temporarily unavailable.</span> : categories.slice(0, 5).map((category) => <Link key={category.id} to={`/products?category=${category.id}`}>{category.shortName} paint</Link>)}</div>
          <div className="footer-column footer-contact"><h3>Come say hello</h3><a href={`mailto:${settings.email}`}>{settings.email}</a><a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}>{settings.phone}</a><p>{settings.address}</p><p>{settings.hours}</p><span className="placeholder-label">Contact details are placeholders</span></div>
        </div>
        <div className="footer-bottom">
          <span>© {settings.companyName || "COLORA PAINTS"}. Made for a more colorful everyday.</span>
          <div><Link to="/privacy-policy">Privacy policy</Link><Link to="/terms">Terms &amp; conditions</Link><Link to="/admin">Admin</Link></div>
        </div>
      </div>
    </footer>
  );
}
