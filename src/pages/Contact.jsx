import { useState } from "react";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import PageLayout from "./PageLayout";

const defaultWhatsAppMessage = "Hello RENTORA, I am interested in a property.";
const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

function Contact({ contact, website, footerText, onNavigateHome }) {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const whatsappUrl = contact.whatsappUrl || `https://wa.me/${(contact.whatsapp || contact.phone).replace(/\D/g, "")}`;
  const withWhatsAppMessage = (message) => `${whatsappUrl}${whatsappUrl.includes("?") ? "&" : "?"}text=${encodeURIComponent(message)}`;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setSubmitted(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    const phoneDigits = formData.phone.replace(/\D/g, "");

    if (formData.fullName.trim().length < 2) {
      nextErrors.fullName = "Enter your full name.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (phoneDigits.length < 7) {
      nextErrors.phone = "Enter a valid phone number.";
    }
    if (formData.subject.trim().length < 3) {
      nextErrors.subject = "Add a short subject.";
    }
    if (formData.message.trim().length < 10) {
      nextErrors.message = "Please enter at least 10 characters.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const inquiry = [
      defaultWhatsAppMessage,
      `Name: ${formData.fullName.trim()}`,
      `Email: ${formData.email.trim()}`,
      `Phone: ${formData.phone.trim()}`,
      `Subject: ${formData.subject.trim()}`,
      `Message: ${formData.message.trim()}`,
    ].join("\n");

    window.open(
      withWhatsAppMessage(inquiry),
      "_blank",
      "noopener,noreferrer"
    );
    setSubmitted(true);
  };

  const whatsappLink = withWhatsAppMessage(defaultWhatsAppMessage);

  return (
    <PageLayout
      eyebrow="WE'RE HERE TO HELP"
      title="Contact RENTORA"
      subtitle="Have a question about a property? Our team is here to help."
      onNavigateHome={onNavigateHome}
      contentClassName="contact-page-grid"
      footerText={footerText}
    >
      <section className="contact-information" aria-labelledby="contact-details-title">
        <div className="contact-section-heading">
          <span className="section-label">GET IN TOUCH</span>
          <h2 id="contact-details-title">Let’s talk property.</h2>
          <p>Choose the channel that works best for you.</p>
        </div>

        <a
          className="contact-info-card contact-whatsapp-card"
          href={whatsappLink}
          target="_blank"
          rel="noreferrer"
        >
          <span className="contact-info-icon"><MessageCircle size={21} /></span>
          <span className="contact-info-copy">
            <small>WhatsApp</small>
            <strong>{contact.whatsapp}</strong>
            <span>Chat with RENTORA</span>
          </span>
          <span className="contact-card-arrow">↗</span>
        </a>

        <a className="contact-info-card" href={`tel:${contact.phone.replace(/\s/g, "")}`}>
          <span className="contact-info-icon"><Phone size={21} /></span>
          <span className="contact-info-copy">
            <small>Company Phone</small>
            <strong>{contact.phone}</strong>
            <span>Call RENTORA</span>
          </span>
          <span className="contact-card-arrow">↗</span>
        </a>

        <a className="contact-info-card" href={`mailto:${contact.email}`}>
          <span className="contact-info-icon"><Mail size={21} /></span>
          <span className="contact-info-copy">
            <small>Email</small>
            <strong>{contact.email}</strong>
            <span>Send us your question</span>
          </span>
          <span className="contact-card-arrow">↗</span>
        </a>

        <a
          className="contact-info-card"
          href={contact.mapsUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${contact.address} in Google Maps`}
        >
          <span className="contact-info-icon"><MapPin size={21} /></span>
          <span className="contact-info-copy">
            <small>Location</small>
            <strong>{contact.address}</strong>
            <span>Open this address in Google Maps</span>
          </span>
          <span className="contact-card-arrow">↗</span>
        </a>

        <div className="contact-note">
          <span>{website.tagline}</span>
          <p>{contact.businessHours}</p>
        </div>

        <nav className="contact-social-links" aria-label="RENTORA social media">
          {["facebook", "instagram", "tiktok", "youtube"].filter((network) => contact[`${network}Url`]).map((network) => (
            <a key={network} href={contact[`${network}Url`]} target="_blank" rel="noreferrer">{network}</a>
          ))}
        </nav>
      </section>

      <section className="contact-form-panel" aria-labelledby="contact-form-title">
        <div className="contact-form-heading">
          <span className="section-label">PROPERTY ENQUIRY</span>
          <h2 id="contact-form-title">Send us a message</h2>
          <p>
            Your details will open in a WhatsApp message. Review it there and
            press Send to deliver it to RENTORA.
          </p>
        </div>

        <form className="contact-page-form" onSubmit={handleSubmit} noValidate>
          <div className="contact-form-row">
            <label>
              Full Name
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                autoComplete="name"
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={errors.fullName ? "contact-name-error" : undefined}
              />
              {errors.fullName && <span className="field-error" id="contact-name-error">{errors.fullName}</span>}
            </label>
            <label>
              Email
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "contact-email-error" : undefined}
              />
              {errors.email && <span className="field-error" id="contact-email-error">{errors.email}</span>}
            </label>
          </div>

          <div className="contact-form-row">
            <label>
              Phone Number
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                autoComplete="tel"
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? "contact-phone-error" : undefined}
              />
              {errors.phone && <span className="field-error" id="contact-phone-error">{errors.phone}</span>}
            </label>
            <label>
              Subject
              <input
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                aria-invalid={Boolean(errors.subject)}
                aria-describedby={errors.subject ? "contact-subject-error" : undefined}
              />
              {errors.subject && <span className="field-error" id="contact-subject-error">{errors.subject}</span>}
            </label>
          </div>

          <label>
            Message
            <textarea
              name="message"
              rows="5"
              value={formData.message}
              onChange={handleChange}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? "contact-message-error" : undefined}
            />
            {errors.message && <span className="field-error" id="contact-message-error">{errors.message}</span>}
          </label>

          <button className="contact-submit-button" type="submit">
            Send on WhatsApp
            <MessageCircle size={17} />
          </button>

          {submitted && (
            <p className="form-success" role="status">
              Your WhatsApp message is ready. Review it in WhatsApp and press Send.
            </p>
          )}
        </form>
      </section>
    </PageLayout>
  );
}

export default Contact;