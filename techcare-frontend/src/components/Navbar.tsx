import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="navbar-wrapper">
      <nav className="navbar">

        {/* LOGO */}
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-icon">
            TC
          </div>

          <span>TechCare</span>
        </Link>

        {/* NAVIGATION */}
        <div className="navbar-links">
          <a href="#services">Services</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>

        {/* ACTIONS */}
        <div className="navbar-actions">
          <Link to="/login" className="navbar-login">
            Log In
          </Link>

          <Link to="/login" className="navbar-start">
            Get Started
          </Link>
        </div>

      </nav>
    </header>
  );
}

export default Navbar;