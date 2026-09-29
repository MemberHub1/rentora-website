import { ArrowLeft } from "lucide-react";

function PageLayout({
  eyebrow,
  title,
  subtitle,
  onNavigateHome,
  contentClassName = "",
  children,
}) {
  return (
    <div className="site standalone-page">
      <header className="header">
        <div className="container nav-container">
          <button className="logo" onClick={onNavigateHome}>
            <span className="logo-mark">R</span>
            <span>
              RENT<span>ORA</span>
            </span>
          </button>
          <button className="back-button" onClick={onNavigateHome}>
            <ArrowLeft size={16} />
            Back to Home
          </button>
        </div>
      </header>

      <main>
        <section className="subpage-hero">
          <div className="container">
            <span className="section-label">{eyebrow}</span>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
        </section>

        <section className="subpage-main">
          <div className={`container ${contentClassName}`}>{children}</div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-bottom">
          <p>© 2026 RENTORA. All rights reserved.</p>
          <button className="footer-page-button" onClick={onNavigateHome}>
            Back to Home
          </button>
        </div>
      </footer>
    </div>
  );
}

export default PageLayout;