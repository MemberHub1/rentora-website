import { ArrowRight, MapPin, ShieldCheck, Users } from "lucide-react";
import PageLayout from "./PageLayout";

function AboutUs({ website, footerText, onNavigateHome }) {
  return (
    <PageLayout
      eyebrow="OUR STORY"
      title={website.aboutHeading}
      subtitle={website.aboutDescription.split("\n\n")[0]}
      onNavigateHome={onNavigateHome}
      contentClassName="about-page-content"
      footerText={footerText}
    >
      <section className="about-page-story">
        <div className="about-page-story-copy">
          <span className="section-label">PROPERTY, MADE PERSONAL</span>
          <h2>{website.aboutHeading}</h2>
          {website.aboutDescription.split("\n\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <a className="gold-button" href="#contact">
            Talk to RENTORA
            <ArrowRight size={17} />
          </a>
        </div>

        <figure className="about-page-image">
          <img
            src="/assets/apartment-3.jpg"
            alt="A RENTORA featured home in Lahore"
          />
          <figcaption>
            <span>RENTORA</span>
            <strong>Your property partner in Lahore</strong>
          </figcaption>
        </figure>
      </section>

      <section className="about-page-values" aria-labelledby="about-values-title">
        <div className="about-page-values-heading">
          <span className="section-label">WHAT MATTERS TO US</span>
          <h2 id="about-values-title">A better property experience starts with clarity.</h2>
        </div>

        <div className="about-page-values-grid">
          <article className="about-value-item">
            <span className="about-value-icon"><ShieldCheck size={22} /></span>
            <h3>Clear information</h3>
            <p>
              Practical listing details help you understand a property before
              you make an enquiry.
            </p>
          </article>

          <article className="about-value-item">
            <span className="about-value-icon"><MapPin size={22} /></span>
            <h3>Local perspective</h3>
            <p>
              Explore Lahore locations and discover homes across the city’s
              established and growing areas.
            </p>
          </article>

          <article className="about-value-item">
            <span className="about-value-icon"><Users size={22} /></span>
            <h3>Human guidance</h3>
            <p>
              Ask questions and connect with the RENTORA team as you consider
              your property options.
            </p>
          </article>
        </div>
      </section>

      <section className="about-page-contact">
        <div>
          <span className="section-label">START YOUR SEARCH</span>
          <h2>Let’s find a place that feels right.</h2>
        </div>
        <a className="outline-button" href="#contact">
          Contact our team
          <ArrowRight size={17} />
        </a>
      </section>
    </PageLayout>
  );
}

export default AboutUs;