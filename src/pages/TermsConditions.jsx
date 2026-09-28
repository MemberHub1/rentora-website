import { Mail } from "lucide-react";
import PageLayout from "./PageLayout";

const sections = [
  {
    title: "Introduction",
    body: "These Terms & Conditions apply when you access or use the RENTORA website. By using the site, you agree to these terms. If you do not agree, please discontinue use of the website.",
  },
  {
    title: "Use of Website",
    body: "You may use the website to browse property information and make genuine enquiries. You are responsible for providing accurate information when you contact us and for using the site in accordance with applicable law.",
  },
  {
    title: "Property Information",
    body: "Descriptions, images, prices, availability, areas, and other listing details are provided for general information. They may change and should be confirmed with RENTORA and independently checked before you make a decision.",
  },
  {
    title: "Property Listings",
    body: "A listing on this site is not a binding offer, reservation, or guarantee that a property is available. Any viewing, negotiation, tenancy, purchase, or other transaction is subject to separate confirmation and agreement between the relevant parties.",
  },
  {
    title: "User Enquiries",
    body: "Enquiry forms prepare a message for WhatsApp. You choose whether to send it. Do not submit confidential, sensitive, or unnecessary personal information through the website or messaging services.",
  },
  {
    title: "Accuracy of Information",
    body: "We make reasonable efforts to present useful information but do not promise that every page or listing is complete, current, or error-free. Contact us to confirm important details before relying on them.",
  },
  {
    title: "Third-Party Links",
    body: "The site may link to services operated by third parties, including WhatsApp. RENTORA does not control those services, and their own terms and privacy policies apply when you use them.",
  },
  {
    title: "Intellectual Property",
    body: "Website text, branding, design, and other materials are owned by RENTORA or used with permission, unless otherwise noted. You may browse the site for personal, non-commercial use; copying or republishing material requires the relevant rights holder's permission.",
  },
  {
    title: "Prohibited Use",
    body: "Do not misuse the website, attempt unauthorized access, interfere with its operation, introduce malicious code, scrape it in a way that harms the service, or use it to submit unlawful, deceptive, or abusive content.",
  },
  {
    title: "Limitation of Liability",
    body: "To the extent permitted by applicable law, RENTORA is not responsible for losses arising from reliance on unverified listing information, third-party services, or temporary website unavailability. Nothing in these terms excludes a liability that cannot lawfully be excluded.",
  },
  {
    title: "Changes to Terms",
    body: "We may revise these terms as the website or our practices change. Continued use after revised terms are posted means you accept the updated terms to the extent permitted by law.",
  },
  {
    title: "Governing Law",
    body: "These terms are intended to be interpreted under the laws applicable in Pakistan, subject to any mandatory consumer protections or other rules that apply to you. Any dispute is subject to the jurisdiction of a competent court.",
  },
];

function TermsConditions({ onNavigateHome }) {
  return (
    <PageLayout
      eyebrow="WEBSITE TERMS"
      title="Terms & Conditions"
      subtitle="Please review these terms before using RENTORA's website and property information."
      onNavigateHome={onNavigateHome}
      contentClassName="legal-content"
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
          <h2>Contact Information</h2>
          <p>
            If you have a question about these terms, contact RENTORA at
            support@rentora.com.
          </p>
          <a className="text-link" href="mailto:support@rentora.com">
            <Mail size={17} />
            support@rentora.com
          </a>
        </section>
      </article>
      <button className="gold-button page-home-button" onClick={onNavigateHome}>
        Back to Home
      </button>
    </PageLayout>
  );
}

export default TermsConditions;