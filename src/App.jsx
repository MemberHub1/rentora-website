import { useEffect, useState } from "react";
import {
  Search,
  MapPin,
  Home,
  Building2,
  BedDouble,
  Bath,
  Ruler,
  ArrowRight,
  Users,
  ShieldCheck,
  Award,
  Phone,
  Mail,
  MessageCircle,
  Menu,
  X,
  Heart,
  ChevronRight,
  Star,
} from "lucide-react";

import "./App.css";
import {
  loadContent,
  loadPublishedCmsContentFromSupabase,
} from "./contentStore";
import { supabase } from "./lib/supabaseClient";
import ArticlePage from "./pages/ArticlePage";
import Contact from "./pages/Contact";
import AboutUs from "./pages/AboutUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import AdminPage from "./pages/AdminPage";

const whatsappUrl = (contact, message = "Hello RENTORA, I am interested in a property.") => {
  const baseUrl = contact.whatsappUrl || `https://wa.me/${(contact.whatsapp || contact.phone).replace(/\D/g, "")}`;
  return `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}text=${encodeURIComponent(message)}`;
};

const publicSocialLinks = (contact, links) => {
  const contactLinks = ["facebook", "instagram", "tiktok", "youtube"]
    .filter((network) => contact[`${network}Url`])
    .map((network) => ({ platform: network, displayName: network, url: contact[`${network}Url`] }));
  if (contact.whatsappChannelUrl) {
    contactLinks.push({ platform: "WhatsApp Channel", displayName: "WhatsApp Channel", url: contact.whatsappChannelUrl });
  }
  const uniqueUrls = new Set();
  return [...contactLinks, ...links.filter((link) => link.published !== false)]
    .filter((link) => link.url && !uniqueUrls.has(link.url) && uniqueUrls.add(link.url));
};

const articleSlugFromHash = () =>
  window.location.hash.match(/^#article\/([^/]+)$/)?.[1] ?? null;

const pageFromHash = (availableArticles) => {
  const page = window.location.hash.slice(1);
  if (availableArticles.some((article) => article.slug === articleSlugFromHash() && article.published !== false)) {
    return "article";
  }
  return ["about", "privacy", "terms", "contact", "admin"].includes(page) ? page : "home";
};

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [content, setContent] = useState(loadContent);
  const siteProperties = content.properties;
  const websiteSocialLinks = publicSocialLinks(content.contact, content.socialLinks);
  const [favorites, setFavorites] = useState([]);

  const [searchData, setSearchData] = useState({
    location: "",
    type: "",
    purpose: "",
    budget: "",
  });
  const [submittedSearch, setSubmittedSearch] = useState(null);

  const [currentPage, setCurrentPage] = useState(() => pageFromHash(content.articles));

  const [selectedArticle, setSelectedArticle] = useState(() =>
    content.articles.find((article) => article.slug === articleSlugFromHash() && article.published !== false) ?? null
  );

  const [selectedProperty, setSelectedProperty] = useState(null);
  const [propertyLoadError, setPropertyLoadError] = useState("");

  useEffect(() => {
    if (currentPage === "admin") return undefined;

    let active = true;

    const loadPublishedContent = async () => {
      try {
        const publishedContent = await loadPublishedCmsContentFromSupabase();
        if (!active) return;

        setContent(publishedContent);
        setPropertyLoadError("");
      } catch (error) {
        console.error("Could not load published website content from Supabase.", error);
        if (!active) return;
        setPropertyLoadError("Website content could not be loaded from Supabase. Check your connection and try again.");
      }
    };

    loadPublishedContent();
    const channel = supabase?.channel("public-cms-content")
      .on("postgres_changes", { event: "*", schema: "public" }, loadPublishedContent)
      .subscribe();

    return () => {
      active = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [currentPage]);

  /* =========================
     FAVORITES
  ========================= */

  const toggleFavorite = (propertyTitle) => {
    setFavorites((current) =>
      current.includes(propertyTitle)
        ? current.filter((item) => item !== propertyTitle)
        : [...current, propertyTitle]
    );
  };

  /* =========================
     SEARCH
  ========================= */

  const handleSearch = (e) => {
    e.preventDefault();
    setSubmittedSearch(searchData);

    document.getElementById("properties")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const propertyStatusNotice = propertyLoadError ? (
    <div className="admin-notice" role="status">{propertyLoadError}</div>
  ) : null;

  /* =========================
     CLOSE MOBILE MENU
  ========================= */

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const navigateToPage = (page) => {
    const hash = page === "home" ? "#home" : `#${page}`;
    if (window.location.hash !== hash) {
      window.history.pushState({ page }, "", hash);
    }
    setCurrentPage(page);
    if (page !== "article") setSelectedArticle(null);
    closeMenu();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openArticle = (article) => {
    window.history.pushState(
      { page: "article", slug: article.slug },
      "",
      `#article/${article.slug}`
    );
    setSelectedArticle(article);
    setCurrentPage("article");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigateToArticles = () => {
    window.history.pushState({ page: "home" }, "", "#blog");
    setSelectedArticle(null);
    setCurrentPage("home");
    window.requestAnimationFrame(() => {
      document.getElementById("blog")?.scrollIntoView({ behavior: "smooth" });
    });
  };

  useEffect(() => {
    const syncPageWithHash = () => {
      const hash = window.location.hash.slice(1);
      const article = content.articles.find(
        (item) => item.slug === articleSlugFromHash() && item.published !== false
      );

      if (article) {
        setSelectedArticle(article);
        setCurrentPage("article");
      } else if (["about", "privacy", "terms", "contact", "admin"].includes(hash)) {
        setSelectedArticle(null);
        setCurrentPage(hash);
      } else if (!hash || hash === "home" || hash === "blog") {
        setSelectedArticle(null);
        setCurrentPage("home");
      }
    };

    syncPageWithHash();
    window.addEventListener("hashchange", syncPageWithHash);
    window.addEventListener("popstate", syncPageWithHash);
    return () => {
      window.removeEventListener("hashchange", syncPageWithHash);
      window.removeEventListener("popstate", syncPageWithHash);
    };
  }, [content.articles]);

  /* =========================
     OPEN PROPERTY DETAILS
  ========================= */

  const openPropertyDetails = (property) => {
    setSelectedProperty(property);
    setCurrentPage("details");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const visibleProperties = siteProperties.filter((property) => {
    if (property.published === false) return false;
    if (!submittedSearch) return true;

    const price = Number(property.price.replace(/[^\d]/g, ""));
    const budget = Number(submittedSearch.budget);

    return (
      (!submittedSearch.location ||
        property.location
          .toLowerCase()
          .includes(submittedSearch.location.toLowerCase())) &&
      (!submittedSearch.type || property.type === submittedSearch.type) &&
      (!submittedSearch.purpose ||
        property.purpose
          .toLowerCase()
          .includes(submittedSearch.purpose.toLowerCase())) &&
      (!budget || price >= budget)
    );
  });

  const submitContactRequest = (event, propertyTitle = "") => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const message = [
      "Hello RENTORA, I would like more information.",
      propertyTitle && `Property: ${propertyTitle}`,
      `Name: ${formData.get("name")}`,
      `Phone: ${formData.get("phone")}`,
      formData.get("email") && `Email: ${formData.get("email")}`,
      formData.get("interest") && `Looking for: ${formData.get("interest")}`,
      formData.get("message") && `Message: ${formData.get("message")}`,
    ]
      .filter(Boolean)
      .join("\n");

    window.open(whatsappUrl(content.contact, message), "_blank", "noopener,noreferrer");
  };

  if (currentPage === "article" && selectedArticle) {
    return (
      <ArticlePage
        article={selectedArticle}
        footerText={content.website.footerText}
        onNavigateHome={() => navigateToPage("home")}
        onNavigateArticles={navigateToArticles}
      />
    );
  }

  if (currentPage === "about") {
    return <AboutUs website={content.website} footerText={content.website.footerText} onNavigateHome={() => navigateToPage("home")} />;
  }

  if (currentPage === "privacy") {
    return <PrivacyPolicy contact={content.contact} footerText={content.website.footerText} onNavigateHome={() => navigateToPage("home")} />;
  }

  if (currentPage === "terms") {
    return <TermsConditions contact={content.contact} footerText={content.website.footerText} onNavigateHome={() => navigateToPage("home")} />;
  }

  if (currentPage === "contact") {
    return <Contact contact={content.contact} socialLinks={websiteSocialLinks} website={content.website} footerText={content.website.footerText} onNavigateHome={() => navigateToPage("home")} />;
  }

  if (currentPage === "admin") {
    return (
      <AdminPage
        content={content}
        onChange={setContent}
        onBackHome={() => navigateToPage("home")}
      />
    );
  }

  /* =========================================================
     PROPERTY DETAILS PAGE
  ========================================================= */

  if (currentPage === "details" && selectedProperty) {
    return (
      <div className="site apartment-details-page">
        {/* HEADER */}
        <header className="header">
          <div className="container nav-container">

            <button
              className="back-button"
              onClick={() => {
                setCurrentPage("apartments");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              ← Back to Apartments
            </button>

            <button
              className="logo"
              onClick={() => {
                setCurrentPage("home");
                setSelectedProperty(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <span className="logo-mark">R</span>

              <span>
                RENT<span>ORA</span>
              </span>
            </button>

          </div>
        </header>

        {/* PROPERTY DETAILS */}
        <main>

          <section className="property-detail-section">
            <div className="container">

              {/* IMAGE */}
              <div className="property-detail-image">
                <img
                  src={selectedProperty.image}
                  alt={selectedProperty.title}
                />
              </div>

              {/* CONTENT */}
              <div className="property-detail-content">

                <span className="property-type">
                  {selectedProperty.type}
                </span>

                <h1>{selectedProperty.title}</h1>

                <div className="detail-location">
                  <MapPin size={19} />
                  <span>{selectedProperty.location}</span>
                </div>

                <div className="detail-price">
                  <small>Monthly Rent</small>

                  <strong>
                    {selectedProperty.price}
                  </strong>
                </div>

                {/* FEATURES */}
                <div className="detail-features">

                  <div>
                    <BedDouble size={22} />

                    <span>
                      <strong>
                        {selectedProperty.beds}
                      </strong>

                      Beds
                    </span>
                  </div>

                  <div>
                    <Bath size={22} />

                    <span>
                      <strong>
                        {selectedProperty.baths}
                      </strong>

                      Baths
                    </span>
                  </div>

                  <div>
                    <Ruler size={22} />

                    <span>
                      <strong>
                        {selectedProperty.area}
                      </strong>
                    </span>
                  </div>

                </div>

                {/* DESCRIPTION */}
                <div className="detail-description">

                  <h2>Property Details</h2>

                  <p>
                    {selectedProperty.description || `This ${selectedProperty.type.toLowerCase()} is located in ${selectedProperty.location}. Contact RENTORA for availability and viewing details.`}
                  </p>

                  <p>
                    This property is suitable for
                    individuals and families looking
                    for a comfortable and convenient
                    place to live.
                  </p>

                  <p>
                    Contact RENTORA for more
                    information about availability,
                    rent and property viewing.
                  </p>

                </div>

                {/* ACTIONS */}
                <div className="detail-actions">

                  <a
                    className="gold-button"
                    href={whatsappUrl(content.contact,
                      `Hello RENTORA, I am interested in ${selectedProperty.title}.`
                    )}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Contact Agent
                    <MessageCircle size={18} />
                  </a>

                  <button
                    className="outline-button"
                    onClick={() => {
                      setCurrentPage("apartments");
                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }}
                  >
                    Back to Apartments
                  </button>

                </div>

              </div>
            </div>
          </section>

          {/* PROPERTY CONTACT */}
          <section
            className="consultation-section"
            id="contact-details"
          >
            <div className="container">

              <div className="consultation-box">

                <div className="consultation-text">

                  <span className="section-label">
                    INTERESTED?
                  </span>

                  <h2>
                    Want to Know More About
                    <br />

                    <span>
                      {selectedProperty.title}?
                    </span>
                  </h2>

                  <p>
                    Contact RENTORA for more
                    information about this property,
                    availability and viewing options.
                  </p>

                </div>

                <form
                  className="consultation-form"
                  onSubmit={(event) =>
                    submitContactRequest(event, selectedProperty.title)
                  }
                >

                  <h3>
                    Request Property Information
                  </h3>

                  <p>
                    WhatsApp will open with this property and your details.
                    Review the message there and press Send.
                  </p>

                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    required
                  />

                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    required
                  />

                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                  />

                  <textarea
                    rows="4"
                    name="message"
                    placeholder={`I am interested in ${selectedProperty.title}`}
                  ></textarea>

                  <button
                    type="submit"
                    className="search-button"
                  >
                    Send on WhatsApp

                    <MessageCircle size={18} />
                  </button>

                </form>

              </div>
            </div>
          </section>

        </main>

        {/* FOOTER */}
        <footer className="footer">

          <div className="container footer-bottom">

            <p>
              {content.website.footerText}
            </p>

            <button
              className="footer-page-button"
              onClick={() => {
                setCurrentPage("home");
                setSelectedProperty(null);

                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
            >
              Home
            </button>

          </div>

        </footer>

      </div>
    );
  }

  /* =========================================================
     ALL APARTMENTS PAGE
  ========================================================= */

  if (currentPage === "apartments") {
    return (
      <div className="site apartments-page">

        {/* HEADER */}
        <header className="header">

          <div className="container nav-container">

            <button
              className="back-button"
              onClick={() => {
                setCurrentPage("home");

                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
            >
              ← Back to Home
            </button>

            <button
              className="logo"
              onClick={() => {
                setCurrentPage("home");

                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
            >
              <span className="logo-mark">R</span>

              <span>
                RENT<span>ORA</span>
              </span>
            </button>

          </div>

        </header>

        {/* APARTMENTS HERO */}
        <section className="apartments-hero">

          <div className="container">

            <span className="section-label">
              RENTORA APARTMENTS
            </span>

            <h1>All Apartments</h1>

            <p>
              Explore our available apartments in
              Lahore and find a property that matches
              your lifestyle and budget.
            </p>

          </div>

        </section>

        {/* APARTMENTS LIST */}
        <section className="section">

          <div className="container">

            <div className="section-heading">

              <div>

                <span className="section-label">
                  AVAILABLE APARTMENTS
                </span>

                <h2>
                  Find Your New Home
                </h2>

                <p>
                  Browse our apartment listings in
                  Lahore.
                </p>

              </div>

              <button
                className="outline-button"
                onClick={() => {
                  setCurrentPage("home");

                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
              >
                Back to Home
              </button>

            </div>

            <div className="property-grid">

              {visibleProperties
                .filter(
                  (property) =>
                    property.type === "Apartment"
                )
                .map((property) => (

                  <article
                    className="property-card"
                    key={property.title}
                  >

                    {/* IMAGE */}
                    <div className="property-image">

                      <img
                        src={property.image}
                        alt={property.title}
                      />

                      <div className="property-top">

                        <span className="property-badge">
                          {property.purpose}
                        </span>

                        <button
                          className={`heart-button ${
                            favorites.includes(property.title)
                              ? "active"
                              : ""
                          }`}
                            onClick={() =>
                            toggleFavorite(property.title)
                          }
                          aria-label="Add to favorites"
                        >
                          <Heart
                            size={18}
                            fill={
                              favorites.includes(property.title)
                                ? "currentColor"
                                : "none"
                            }
                          />
                        </button>

                      </div>

                      <div className="image-location">

                        <MapPin size={14} />

                        {property.location}

                      </div>

                    </div>

                    {/* CONTENT */}
                    <div className="property-content">

                      <span className="property-type">
                        {property.type}
                      </span>

                      <h3>
                        {property.title}
                      </h3>

                      <div className="property-details">

                        <span>
                          <BedDouble size={16} />
                          {property.beds} Beds
                        </span>

                        <span>
                          <Bath size={16} />
                          {property.baths} Baths
                        </span>

                        <span>
                          <Ruler size={16} />
                          {property.area}
                        </span>

                      </div>

                      <div className="property-bottom">

                        <div>

                          <small>
                            Monthly Price
                          </small>

                          <strong>
                            {property.price}
                          </strong>

                        </div>

                        {/* DETAILS BUTTON */}
                        <button
                          className="details-button"
                          onClick={() =>
                            openPropertyDetails(
                              property
                            )
                          }
                        >
                          Details

                          <ArrowRight size={16} />
                        </button>

                      </div>

                    </div>

                  </article>

                ))}

            </div>

          </div>

        </section>

        {/* FOOTER */}
        <footer className="footer">

          <div className="container footer-bottom">

            <p>
              {content.website.footerText}
            </p>

            <button
              className="footer-page-button"
              onClick={() => {
                setCurrentPage("home");

                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
            >
              Home
            </button>

          </div>

        </footer>

      </div>
    );
  }

  /* =========================================================
     HOME PAGE
  ========================================================= */

  return (
    <div className="site">

      {/* HEADER */}
      <header className="header">

        <div className="container nav-container">

          <button
            className="logo"
            onClick={() => {
              setCurrentPage("home");
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
          >
            <span className="logo-mark">
              R
            </span>

            <span>
              RENT<span>ORA</span>
            </span>

          </button>

          {/* NAVIGATION */}
          <nav
            className={`nav ${
              menuOpen ? "nav-open" : ""
            }`}
          >

            <a
              href="#home"
              onClick={closeMenu}
            >
              Home
            </a>

            <a
              href="#properties"
              onClick={(event) => {
                event.preventDefault();
                setCurrentPage("apartments");
                closeMenu();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Apartments
            </a>

            <a
              href="#projects"
              onClick={closeMenu}
            >
              Projects
            </a>

            <a
              href="#about"
              onClick={(event) => {
                event.preventDefault();
                navigateToPage("about");
              }}
            >
              About
            </a>

            <a
              href="#agents"
              onClick={closeMenu}
            >
              Agents
            </a>

            <a
              href="#blog"
              onClick={closeMenu}
            >
              Blog
            </a>

            <a
              href="#contact"
              onClick={(event) => {
                event.preventDefault();
                navigateToPage("contact");
              }}
            >
              Contact
            </a>

          </nav>

          <a
            href="#contact-section"
            className="nav-button"
          >
            List Property
          </a>

          {/* MOBILE MENU */}
          <button
            className="menu-button"
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X size={25} />
            ) : (
              <Menu size={25} />
            )}
          </button>

        </div>

      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main>
        {propertyStatusNotice}

        {/* HERO */}
        <section
          className="hero"
          id="home"
        >

          <img
            className="hero-bg-image"
            src={content.website.heroImage || "/assets/apartment-1.jpg"}
            alt="Luxury apartment"
          />

          <div className="hero-glow hero-glow-one"></div>

          <div className="hero-glow hero-glow-two"></div>

          <div className="container hero-content">

            <div className="hero-text">

              <h1>{content.website.heroHeading}</h1>

              <p>{content.website.heroSubtitle}</p>

              <div className="hero-actions">

                <a
                  href="#properties"
                  className="gold-button"
                >
                  Explore Properties

                  <ArrowRight size={18} />
                </a>

                <a
                  href={whatsappUrl(content.contact)}
                  className="outline-button"
                  target="_blank"
                  rel="noreferrer"
                >
                  Talk to RENTORA
                  <MessageCircle size={17} />
                </a>

              </div>

              <div className="hero-stats">

                <div>
                  <strong>500+</strong>
                  <span>Properties</span>
                </div>

                <div>
                  <strong>50+</strong>
                  <span>Prime Locations</span>
                </div>

                <div>
                  <strong>100%</strong>
                  <span>Professional</span>
                </div>

              </div>

            </div>

            {/* SEARCH CARD */}
            <div className="hero-card">

              <div className="hero-card-heading">

                <span className="mini-icon">
                  <Search size={18} />
                </span>

                <div>

                  <h3>
                    Find Your Property
                  </h3>

                  <p>
                    Search from our available
                    properties
                  </p>

                </div>

              </div>

              <form onSubmit={handleSearch}>

                {/* LOCATION */}
                <label>

                  Location

                  <div className="input-box">

                    <MapPin size={18} />

                    <select
                      value={
                        searchData.location
                      }
                      onChange={(e) =>
                        setSearchData({
                          ...searchData,
                          location:
                            e.target.value,
                        })
                      }
                    >

                      <option value="">
                        Select Location
                      </option>

                      <option value="DHA Lahore">
                        DHA Lahore
                      </option>

                      <option value="Gulberg Lahore">
                        Gulberg Lahore
                      </option>

                      <option value="Bahria Town">
                        Bahria Town
                      </option>

                      <option value="Al Ghani Garden">
                        Al Ghani Garden
                      </option>

                    </select>

                  </div>

                </label>

                {/* PROPERTY TYPE */}
                <label>

                  Property Type

                  <div className="input-box">

                    <Building2 size={18} />

                    <select
                      value={
                        searchData.type
                      }
                      onChange={(e) =>
                        setSearchData({
                          ...searchData,
                          type: e.target.value,
                        })
                      }
                    >

                      <option value="">
                        Any Property Type
                      </option>

                      <option value="Apartment">
                        Apartment
                      </option>

                      <option value="House">
                        House
                      </option>

                      <option value="Plot">
                        Plot
                      </option>

                      <option value="Commercial">
                        Commercial
                      </option>

                    </select>

                  </div>

                </label>

                {/* PURPOSE + BUDGET */}
                <div className="form-row">

                  <label>

                    Purpose

                    <div className="input-box">

                      <Home size={18} />

                      <select
                        value={
                          searchData.purpose
                        }
                        onChange={(e) =>
                          setSearchData({
                            ...searchData,
                            purpose:
                              e.target.value,
                          })
                        }
                      >

                        <option value="">
                          Buy / Rent
                        </option>

                        <option value="Buy">
                          Buy
                        </option>

                        <option value="Rent">
                          Rent
                        </option>

                      </select>

                    </div>

                  </label>

                  <label>

                    Budget

                    <div className="input-box">

                      <span className="rupee">
                        Rs.
                      </span>

                      <select
                        value={
                          searchData.budget
                        }
                        onChange={(e) =>
                          setSearchData({
                            ...searchData,
                            budget:
                              e.target.value,
                          })
                        }
                      >

                        <option value="">
                          Any Budget
                        </option>

                        <option value="50000">
                          50,000+
                        </option>

                        <option value="100000">
                          100,000+
                        </option>

                        <option value="150000">
                          150,000+
                        </option>

                        <option value="200000">
                          200,000+
                        </option>

                      </select>

                    </div>

                  </label>

                </div>

                <button
                  type="submit"
                  className="search-button"
                >

                  <Search size={19} />

                  Search Properties

                </button>

              </form>

            </div>

          </div>

        </section>

        {/* =================================================
            FEATURED PROPERTIES
        ================================================= */}

        <section
          className="section properties-section"
          id="properties"
        >

          <div className="container">

            <div className="section-heading">

              <div>

                <span className="section-label">
                  OUR LISTINGS
                </span>

                <h2>
                  Featured Properties
                </h2>

                <p>
                  Explore hand-picked properties
                  available in Lahore's most
                  desirable locations.
                </p>

              </div>

              {/* VIEW ALL */}
              <button
                className="view-all"
                onClick={() => {
                  setCurrentPage("apartments");

                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
              >

                View All Apartments

                <ChevronRight size={18} />

              </button>

            </div>

            <div className="property-grid">

              {visibleProperties.length > 0 ? visibleProperties.map(
                (property) => (

                  <article
                    className="property-card"
                    key={property.title}
                  >

                    {/* PROPERTY IMAGE */}
                    <div className="property-image">

                      <img
                        src={property.image}
                        alt={property.title}
                      />

                      <div className="property-top">

                        <span className="property-badge">
                          {property.purpose}
                        </span>

                        <button
                          className={`heart-button ${
                            favorites.includes(property.title)
                              ? "active"
                              : ""
                          }`}
                            onClick={() =>
                            toggleFavorite(property.title)
                          }
                          aria-label="Add to favorites"
                        >

                          <Heart
                            size={18}
                            fill={
                              favorites.includes(property.title)
                                ? "currentColor"
                                : "none"
                            }
                          />

                        </button>

                      </div>

                      <div className="image-location">

                        <MapPin size={14} />

                        {property.location}

                      </div>

                    </div>

                    {/* PROPERTY CONTENT */}
                    <div className="property-content">

                      <span className="property-type">
                        {property.type}
                      </span>

                      <h3>
                        {property.title}
                      </h3>

                      <div className="property-details">

                        <span>
                          <BedDouble size={16} />

                          {property.beds} Beds
                        </span>

                        <span>
                          <Bath size={16} />

                          {property.baths} Baths
                        </span>

                        <span>
                          <Ruler size={16} />

                          {property.area}
                        </span>

                      </div>

                      <div className="property-bottom">

                        <div>

                          <small>
                            Monthly Price
                          </small>

                          <strong>
                            {property.price}
                          </strong>

                        </div>

                        {/* HOME DETAILS BUTTON */}
                        <button
                          className="details-button"
                          onClick={() =>
                            openPropertyDetails(
                              property
                            )
                          }
                        >

                          Details

                          <ArrowRight size={16} />

                        </button>

                      </div>

                    </div>

                  </article>

                )
              ) : (
                <p className="empty-results">
                  No properties match those filters. Try a broader search.
                </p>
              )}

            </div>

          </div>

        </section>

        {/* =================================================
            PROJECTS
        ================================================= */}

        <section
          className="section projects-section"
          id="projects"
        >

          <div className="container">

            <div className="center-heading">

              <span className="section-label">
                EXPLORE LOCATIONS
              </span>

              <h2>
                Popular Projects & Areas
              </h2>

              <p>
                Explore some of Lahore's most
                popular residential and investment
                destinations.
              </p>

            </div>

            <div className="project-grid">

              {content.locations.filter((location) => location.published !== false).map((project) => (

                <article
                  className="project-card"
                    key={project.id || project.title}
                >

                  <img
                    src={project.image || "/assets/apartment-1.jpg"}
                    alt={project.title}
                  />

                  <div className="project-overlay">

                    <span>
                      EXPLORE
                    </span>

                    <h3>
                      {project.title}
                    </h3>

                    <p>{project.shortDescription || project.description}</p>
                    <small className="project-property-count">
                      {project.propertyCount ?? siteProperties.filter((property) => property.published !== false && property.location.toLowerCase().includes(project.title.toLowerCase())).length} properties
                    </small>

                    <button
                      onClick={() => {
                        setCurrentPage("apartments");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      Explore Area
                      <ArrowRight size={16} />
                    </button>

                  </div>

                </article>

              ))}

            </div>

          </div>

        </section>

        {/* =================================================
            ABOUT
        ================================================= */}

        <section
          className="section about-section"
          id="about-section"
        >

          <div className="container about-grid">

            <div className="about-visual">

              <div className="about-main-card">

                <img
                  src={content.website.aboutImage || "/assets/apartment-3.jpg"}
                  alt="RENTORA property"
                />

                <div className="experience-card">

                  <strong>
                    RENTORA
                  </strong>

                  <span>
                    Your Property Partner
                  </span>

                </div>

              </div>

            </div>

            <div className="about-content">

              <span className="section-label">
                WHY RENTORA
              </span>

              <h2>{content.website.aboutHeading}</h2>

              <p className="managed-about-description">{content.website.aboutDescription}</p>

              <div className="feature-list">

                <div className="feature-item">

                  <div className="feature-icon">
                    <ShieldCheck size={22} />
                  </div>

                  <div>

                    <h4>
                      Verified Properties
                    </h4>

                    <p>
                      Quality listings with clear
                      property information.
                    </p>

                  </div>

                </div>

                <div className="feature-item">

                  <div className="feature-icon">
                    <MapPin size={22} />
                  </div>

                  <div>

                    <h4>
                      Prime Locations
                    </h4>

                    <p>
                      Discover properties in Lahore's
                      most sought-after areas.
                    </p>

                  </div>

                </div>

                <div className="feature-item">

                  <div className="feature-icon">
                    <Users size={22} />
                  </div>

                  <div>

                    <h4>
                      Expert Guidance
                    </h4>

                    <p>
                      Get professional assistance
                      throughout your property journey.
                    </p>

                  </div>

                </div>

              </div>

              <a
                href={whatsappUrl(content.contact)}
                className="gold-button"
                target="_blank"
                rel="noreferrer"
              >
                Talk to RENTORA
                <MessageCircle size={18} />
              </a>

            </div>

          </div>

        </section>

        {/* =================================================
            AGENTS
        ================================================= */}

        <section
          className="section agents-section"
          id="agents"
        >

          <div className="container">

            <div className="center-heading">

              <span className="section-label">
                OUR TEAM
              </span>

              <h2>
                Meet Our Property Experts
              </h2>

              <p>
                Professional guidance to help you
                make informed property decisions.
              </p>

            </div>

            <div className="agents-grid">

              {content.team.filter((agent) => agent.published !== false).map((agent) => (

                <article
                  className="agent-card"
                  key={agent.id || agent.name}
                >

                  <div className="agent-avatar">
                    {agent.image ? <img src={agent.image} alt={agent.name} /> : agent.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
                  </div>

                  <h3>
                    {agent.name}
                  </h3>

                  <p>{agent.role}</p>
                  {agent.bio && <p className="agent-bio">{agent.bio}</p>}

                  <div className="agent-stars">

                    <Star
                      size={15}
                      fill="currentColor"
                    />

                    <Star
                      size={15}
                      fill="currentColor"
                    />

                    <Star
                      size={15}
                      fill="currentColor"
                    />

                    <Star
                      size={15}
                      fill="currentColor"
                    />

                    <Star
                      size={15}
                      fill="currentColor"
                    />

                  </div>

                  {(agent.phone || agent.email || agent.facebookUrl || agent.instagramUrl || agent.linkedinUrl) && (
                    <div className="agent-contact-details">
                      {agent.phone && <a href={`tel:${agent.phone.replace(/\s/g, "")}`}>{agent.phone}</a>}
                      {agent.email && <a href={`mailto:${agent.email}`}>{agent.email}</a>}
                      <div>
                        {["facebook", "instagram", "linkedin"].filter((network) => agent[`${network}Url`]).map((network) => (
                          <a key={network} href={agent[`${network}Url`]} target="_blank" rel="noreferrer">{network}</a>
                        ))}
                      </div>
                    </div>
                  )}

                  <a
                    className="agent-button"
                    href={agent.whatsapp
                      ? `https://wa.me/${agent.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello RENTORA, I would like to speak with ${agent.name}.`)}`
                      : whatsappUrl(content.contact, `Hello RENTORA, I would like to speak with ${agent.name}.`)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Contact Agent
                    <MessageCircle size={16} />
                  </a>

                </article>

              ))}

            </div>

          </div>

        </section>

        {/* =================================================
            TESTIMONIALS
        ================================================= */}

        <section
          className="section testimonials-section"
        >

          <div className="container">

            <div className="center-heading">

              <span className="section-label">
                CLIENT STORIES
              </span>

              <h2>
                What Our Clients Say
              </h2>

              <p>
                A few words from people who have
                experienced the RENTORA approach.
              </p>

            </div>

            <div className="testimonial-grid">

              <article className="testimonial-card">

                <div className="quote-mark">
                  “
                </div>

                <div className="testimonial-stars">

                  <Star size={15} fill="currentColor" />
                  <Star size={15} fill="currentColor" />
                  <Star size={15} fill="currentColor" />
                  <Star size={15} fill="currentColor" />
                  <Star size={15} fill="currentColor" />

                </div>

                <p>
                  RENTORA made it much easier to
                  find an apartment that matched
                  our requirements and budget.
                </p>

                <strong>
                  Happy Client
                </strong>

                <span>
                  Lahore
                </span>

              </article>

              <article className="testimonial-card">

                <div className="quote-mark">
                  “
                </div>

                <div className="testimonial-stars">

                  <Star size={15} fill="currentColor" />
                  <Star size={15} fill="currentColor" />
                  <Star size={15} fill="currentColor" />
                  <Star size={15} fill="currentColor" />
                  <Star size={15} fill="currentColor" />

                </div>

                <p>
                  The property search experience was
                  simple and professional. The
                  information was easy to understand.
                </p>

                <strong>
                  Property Client
                </strong>

                <span>
                  DHA Lahore
                </span>

              </article>

              <article className="testimonial-card">

                <div className="quote-mark">
                  “
                </div>

                <div className="testimonial-stars">

                  <Star size={15} fill="currentColor" />
                  <Star size={15} fill="currentColor" />
                  <Star size={15} fill="currentColor" />
                  <Star size={15} fill="currentColor" />
                  <Star size={15} fill="currentColor" />

                </div>

                <p>
                  A clean and convenient way to
                  explore property options in
                  Lahore.
                </p>

                <strong>
                  Verified Client
                </strong>

                <span>
                  Gulberg Lahore
                </span>

              </article>

            </div>

          </div>

        </section>

        {/* =================================================
            BLOG
        ================================================= */}

        <section
          className="section blog-section"
          id="blog"
        >

          <div className="container">

            <div className="section-heading">

              <div>

                <span className="section-label">
                  PROPERTY INSIGHTS
                </span>

                <h2>
                  Articles & Tips
                </h2>

                <p>
                  Helpful information for buyers,
                  renters and property investors.
                </p>

              </div>

              <a
                href="#blog"
                className="view-all"
              >
                View All Articles
                <ChevronRight size={18} />
              </a>

            </div>

            <div className="blog-grid">

              {content.articles.filter((article) => article.published !== false).map((article) => (
                <article className="blog-card" key={article.id || article.slug}>
                  <div className="blog-image">
                    <img src={article.image || "/assets/apartment-1.jpg"} alt={article.title} />
                    <span>{article.category || "PROPERTY GUIDE"}</span>
                  </div>
                  <div className="blog-content">
                    <small>{article.author || "RENTORA"}</small>
                    <h3>{article.title}</h3>
                    <p>{article.shortDescription || article.excerpt}</p>
                    <a href={`#article/${article.slug}`} onClick={(event) => { event.preventDefault(); openArticle(article); }}>
                      Read Article <ArrowRight size={15} />
                    </a>
                  </div>
                </article>
              ))}

              {content.articles.length < 0 && <>
              <article className="blog-card">

                <div className="blog-image">

                  <img
                    src="/assets/apartment-1.jpg"
                    alt="Property investment"
                  />

                  <span>
                    PROPERTY GUIDE
                  </span>

                </div>

                <div className="blog-content">

                  <small>
                    Real Estate
                  </small>

                  <h3>
                    Things to Consider Before
                    Renting a Property
                  </h3>

                  <p>
                    A simple guide to choosing the
                    right rental property.
                  </p>

                  <a
                    href={`#article/${articles[0].slug}`}
                    onClick={(event) => {
                      event.preventDefault();
                      openArticle(articles[0]);
                    }}
                  >
                    Read Article
                    <ArrowRight size={15} />
                  </a>

                </div>

              </article>

              <article className="blog-card">

                <div className="blog-image">

                  <img
                    src="/assets/apartment-2.jpg"
                    alt="Lahore property"
                  />

                  <span>
                    LAHORE
                  </span>

                </div>

                <div className="blog-content">

                  <small>
                    Locations
                  </small>

                  <h3>
                    Popular Areas for Property
                    in Lahore
                  </h3>

                  <p>
                    Explore some of Lahore's popular
                    residential locations.
                  </p>

                  <a
                    href={`#article/${articles[1].slug}`}
                    onClick={(event) => {
                      event.preventDefault();
                      openArticle(articles[1]);
                    }}
                  >
                    Read Article
                    <ArrowRight size={15} />
                  </a>

                </div>

              </article>

              <article className="blog-card">

                <div className="blog-image">

                  <img
                    src="/assets/apartment-5.jpg"
                    alt="Property investment"
                  />

                  <span>
                    INVESTMENT
                  </span>

                </div>

                <div className="blog-content">

                  <small>
                    Investment
                  </small>

                  <h3>
                    How to Start Your Property
                    Search
                  </h3>

                  <p>
                    Understand your requirements
                    before making a property decision.
                  </p>

                  <a
                    href={`#article/${articles[2].slug}`}
                    onClick={(event) => {
                      event.preventDefault();
                      openArticle(articles[2]);
                    }}
                  >
                    Read Article
                    <ArrowRight size={15} />
                  </a>

                </div>

              </article>

              <article className="blog-card">

                <div className="blog-image">

                  <img
                    src="/assets/apartment-4.jpg"
                    alt="Apartment for sale in Lahore"
                  />

                  <span>
                    BUYER GUIDE
                  </span>

                </div>

                <div className="blog-content">

                  <small>
                    Buying
                  </small>

                  <h3>
                    What to Check Before Buying a Property
                  </h3>

                  <p>
                    Review location, condition and costs before making a purchase.
                  </p>

                  <a
                    href={`#article/${articles[3].slug}`}
                    onClick={(event) => {
                      event.preventDefault();
                      openArticle(articles[3]);
                    }}
                  >
                    Read Article
                    <ArrowRight size={15} />
                  </a>

                </div>

              </article>
              </>}

            </div>

          </div>

        </section>

        {/* =================================================
            CONTACT
        ================================================= */}

        <section
          className="consultation-section"
          id="contact-section"
        >

          <div className="container">

            <div className="consultation-box">

              <div className="consultation-text">

                <span className="section-label">
                  LET'S TALK
                </span>

                <h2>

                  Ready to Find Your

                  <br />

                  <span>
                    Perfect Property?
                  </span>

                </h2>

                <p>
                  Tell us what you're looking for
                  and our property team will help
                  you explore suitable options.
                </p>

                <div className="contact-points">

                  <a href={`tel:${content.contact.phone.replace(/\s/g, "")}`}>
                    <Phone size={18} />
                    <span>{content.contact.phone}</span>
                  </a>

                  <a
                    href={whatsappUrl(content.contact)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle size={18} />
                    <span>WhatsApp RENTORA</span>
                  </a>

                  <a
                    href={content.contact.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open ${content.contact.address} in Google Maps`}
                  >
                    <MapPin size={18} />
                    <span>{content.contact.address}</span>
                  </a>

                </div>

              </div>

              <form
                className="consultation-form"
                onSubmit={submitContactRequest}
              >

                <h3>
                  Request a Free Consultation
                </h3>

                <p>
                  Your details will open in WhatsApp. Review the message there
                  and press Send to deliver it to RENTORA.
                </p>

                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  required
                />

                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  required
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                />

                <select name="interest" defaultValue="">

                  <option
                    value=""
                    disabled
                  >
                    What are you looking for?
                  </option>

                  <option>
                    Apartment
                  </option>

                  <option>
                    House
                  </option>

                  <option>
                    Plot
                  </option>

                  <option>
                    Commercial Property
                  </option>

                  <option>
                    Investment Property
                  </option>

                </select>

                <textarea
                  rows="3"
                  name="message"
                  placeholder="Tell us about your requirements..."
                ></textarea>

                <button
                  type="submit"
                  className="search-button"
                >

                  Send on WhatsApp

                  <MessageCircle size={18} />

                </button>

              </form>

            </div>

          </div>

        </section>

      </main>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="footer">

        <div className="container footer-grid">

          <div className="footer-brand">

            <button
              className="logo"
              onClick={() => {
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
            >

              <span className="logo-mark">
                R
              </span>

              <span>
                RENT<span>ORA</span>
              </span>

            </button>

            <p>{content.website.footerText}</p>

            <div className="footer-badge">

              <Award size={18} />

              <span>
                {content.website.tagline}
              </span>

            </div>

          </div>

          <div className="footer-column">

            <h4>
              Quick Links
            </h4>

            <a href="#home">
              Home
            </a>

            <a
              href="#properties"
              onClick={(event) => {
                event.preventDefault();
                setCurrentPage("apartments");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Apartments
            </a>

            <a href="#projects">
              Projects
            </a>

            <a href="#about" onClick={(event) => {
              event.preventDefault();
              navigateToPage("about");
            }}>
              About RENTORA
            </a>

            <a href="#agents">
              Our Agents
            </a>

            <a href="#contact" onClick={(event) => {
              event.preventDefault();
              navigateToPage("contact");
            }}>
              Contact
            </a>

            <a href="#privacy" onClick={(event) => {
              event.preventDefault();
              navigateToPage("privacy");
            }}>
              Privacy Policy
            </a>

            <a href="#terms" onClick={(event) => {
              event.preventDefault();
              navigateToPage("terms");
            }}>
              Terms &amp; Conditions
            </a>

          </div>

          <div className="footer-column">

            <h4>
              Property Areas
            </h4>

            {content.locations.filter((location) => location.published !== false).map((location) => (
              <a href="#projects" key={location.id || location.title}>{location.title}</a>
            ))}

          </div>

          <div className="footer-column">

            <h4>
              Contact
            </h4>

            <a href="#contact" onClick={(event) => {
              event.preventDefault();
              navigateToPage("contact");
            }}>

              <Phone size={15} />

              {content.contact.phone}

            </a>

            <a href={`mailto:${content.contact.email}`}>

              <Mail size={15} />

              Property Consultation

            </a>

            <a
              href={content.contact.mapsUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open ${content.contact.address} in Google Maps`}
            >

              <MapPin size={15} />

              {content.contact.address}

            </a>

            <span className="footer-business-hours">{content.contact.businessHours}</span>

            <a
              href="#contact"
              className="footer-contact-button"
              onClick={(event) => {
                event.preventDefault();
                navigateToPage("contact");
              }}
            >

              Get in Touch

              <ArrowRight size={15} />

            </a>

          <nav className="footer-social-links" aria-label="RENTORA social media">
            {websiteSocialLinks.map((link) => (
              <a key={link.id || link.url} href={link.url} target="_blank" rel="noreferrer">{link.displayName || link.platform}</a>
            ))}
          </nav>

          </div>

        </div>

        <div className="container footer-bottom">

          <p>
            {content.website.footerText}
          </p>

          <div>

            <a href="#privacy" onClick={(event) => {
              event.preventDefault();
              navigateToPage("privacy");
            }}>
              Privacy Policy
            </a>

            <a href="#terms" onClick={(event) => {
              event.preventDefault();
              navigateToPage("terms");
            }}>
              Terms &amp; Conditions
            </a>

            <a href="#contact" onClick={(event) => {
              event.preventDefault();
              navigateToPage("contact");
            }}>
              Contact
            </a>

          </div>

        </div>

      </footer>

    </div>
  );
}

export default App;