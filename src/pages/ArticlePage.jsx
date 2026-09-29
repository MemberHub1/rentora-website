import { ArrowLeft, CalendarDays, Clock3 } from "lucide-react";
import PageLayout from "./PageLayout";

function ArticlePage({ article, footerText, onNavigateHome, onNavigateArticles }) {
  return (
    <PageLayout
      eyebrow={article.category}
      title={article.title}
      subtitle={article.excerpt}
      onNavigateHome={onNavigateHome}
      contentClassName="article-page-content"
      footerText={footerText}
    >
      <article className="article-document">
        <button className="article-back-link" onClick={onNavigateArticles}>
          <ArrowLeft size={16} />
          All articles
        </button>

        <div className="article-meta">
          <span><CalendarDays size={15} /> {article.date || "September 29, 2026"}</span>
          <span><Clock3 size={15} /> {article.readTime}</span>
          <span>{article.author || "RENTORA Editorial"}</span>
        </div>

        <figure className="article-cover">
          <img src={article.image} alt={article.title} />
        </figure>

        <div className="article-body">
          {article.content ? article.content.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => (
            <p className={index === 0 ? "article-introduction" : ""} key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
          )) : <p className="article-introduction">{article.introduction}</p>}

          {!article.content && article.sections?.map((section) => (
            <section className="article-section" key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.points && (
                <ul>
                  {section.points.map((point) => <li key={point}>{point}</li>)}
                </ul>
              )}
            </section>
          ))}

          {!article.content && <aside className="article-takeaway">
            <span>KEEP IN MIND</span>
            <p>{article.takeaway}</p>
          </aside>}

          <a className="gold-button article-contact-link" href="#contact">
            Ask RENTORA about a property
          </a>
        </div>
      </article>
    </PageLayout>
  );
}

export default ArticlePage;