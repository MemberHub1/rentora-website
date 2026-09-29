import { Mail } from "lucide-react";
import PageLayout from "./PageLayout";

const sections = [
  {
    title: "Introduction",
    body: "This Privacy Policy explains how RENTORA handles information when you browse our property website or contact us. The website currently does not offer user accounts or store enquiry submissions on a RENTORA server.",
  },
  {
    title: "Information We Collect",
    body: "Browsing the site does not require you to provide personal information. If you complete an enquiry form, the details you enter are used to prepare a message for WhatsApp. The site itself does not save that form data. Your browser and hosting provider may process technical request information as part of delivering the website.",
  },
  {
    title: "How We Use Information",
    body: "Information you choose to include in an enquiry is used to respond to your property question and continue the conversation you initiated. We do not use website enquiry details for automated profiling or advertising.",
  },
  {
    title: "Property Enquiry Information",
    body: "When you submit an enquiry, your browser opens WhatsApp with a message containing the details you entered. You can review or edit that message before sending it. Information is shared with WhatsApp only when you choose to continue and send the message, and then handled under WhatsApp's own terms and privacy policy.",
  },
  {
    title: "Contact Information",
    body: "If you contact RENTORA by email, WhatsApp, or phone, we receive the information you choose to share through that service. We use it to respond to your request and retain it only as needed to manage that conversation or meet applicable obligations.",
  },
  {
    title: "Cookies and Website Analytics",
    body: "The current website does not include an analytics or advertising tracking tool and does not intentionally set analytics cookies. Your browser or hosting provider may use technical storage or logs to operate and protect the service; their handling depends on those providers.",
  },
  {
    title: "Third-Party Services",
    body: "The site links to WhatsApp for enquiries and loads typefaces through Google Fonts. Opening these services may share technical information with their providers. Their services are governed by their own privacy notices and terms.",
  },
  {
    title: "Data Security",
    body: "We take reasonable care with information received through direct enquiries. No method of internet transmission or electronic storage can be guaranteed to be completely secure. The website does not maintain an enquiry database.",
  },
  {
    title: "Data Retention",
    body: "RENTORA does not retain form submissions through this website. Messages sent using WhatsApp or email may remain with the relevant service and in RENTORA's communications for as long as needed to respond and manage the enquiry. Provider-side technical logs are subject to the provider's retention practices.",
  },
  {
    title: "User Rights",
    body: "You may choose what information to include in a message. To ask about information you have shared directly with RENTORA, request a correction, or ask us to delete a conversation where practical, contact us using the details below. Requests concerning WhatsApp or email records should be directed to the relevant provider as well.",
  },
  {
    title: "Children's Privacy",
    body: "RENTORA's property website is intended for a general audience and is not directed to children. Please do not submit a child's personal information through an enquiry.",
  },
  {
    title: "Changes to This Privacy Policy",
    body: "We may update this notice when the website or its practices change. The date below indicates when this version was last updated.",
  },
];

function PrivacyPolicy({ contact, footerText, onNavigateHome }) {
  return (
    <PageLayout
      eyebrow="YOUR INFORMATION"
      title="Privacy Policy"
      subtitle="A clear overview of how information is handled when you use RENTORA."
      onNavigateHome={onNavigateHome}
      contentClassName="legal-content"
      footerText={footerText}
    >
      <article className="legal-document">
        <p className="last-updated">Last Updated: September 29, 2026</p>
        {sections.map((section) => (
          <section className="legal-section" key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </section>
        ))}
        <section className="legal-section">
          <h2>Contact Us</h2>
          <p>
            For questions about this policy or information you have shared
            directly with RENTORA, contact us at {contact.email}.
          </p>
          <a className="text-link" href={`mailto:${contact.email}`}>
            <Mail size={17} />
            {contact.email}
          </a>
        </section>
      </article>
      <button className="gold-button page-home-button" onClick={onNavigateHome}>
        Back to Home
      </button>
    </PageLayout>
  );
}

export default PrivacyPolicy;