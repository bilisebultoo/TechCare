import { Link } from "react-router-dom";

function About() {
  return (
    <section className="about-section" id="about">
      <div className="about-content">
        <span className="about-label">
          ABOUT TECHCARE
        </span>

        <h2>
          We Make Hardware Support
          <span> Easier.</span>
        </h2>

        <p>
          TechCare is a hardware customer support system
          designed to connect customers with professional
          support agents.
        </p>

        <p>
          Customers can report problems, track their tickets,
          communicate with support agents and confirm when
          their problem has been solved.
        </p>

        <Link to="/login" className="about-primary-btn">
          Get Started →
        </Link>
      </div>

      <div className="about-box">
        <div className="about-box-icon">
          🔧
        </div>

        <h3>Complete Support</h3>

        <p>
          From reporting a problem to resolving and closing
          a support ticket.
        </p>
      </div>
    </section>
  );
}

export default About;