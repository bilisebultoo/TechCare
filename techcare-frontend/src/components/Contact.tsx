import { Link } from "react-router-dom";

function Contact() {
  return (
    <section className="contact-section" id="contact">

      <div className="contact-content">
        <span className="contact-label">
          NEED HELP?
        </span>

        <h2>
          We're Here To Help.
        </h2>

        <p>
          Have a hardware problem? Our support team is ready
          to help you.
        </p>
      </div>

      <Link
        to="/login"
        className="contact-primary-btn"
      >
        Contact Support →
      </Link>

    </section>
  );
}

export default Contact;