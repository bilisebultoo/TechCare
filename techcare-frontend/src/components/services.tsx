function Services() {
  return (
    <section className="services-section" id="services">
      <div className="services-heading">
        <span>WHAT WE SUPPORT</span>

        <h2>Hardware Support Made Simple</h2>

        <p>
          Get help with your devices quickly and easily.
        </p>
      </div>

      <div className="service-grid">

        <div className="service-card">
          <div className="service-icon">
            💻
          </div>

          <h3>Laptops & Desktops</h3>

          <p>
            Get help with performance, charging,
            screen, keyboard and other problems.
          </p>
        </div>

        <div className="service-card">
          <div className="service-icon">
            🖨️
          </div>

          <h3>Printers</h3>

          <p>
            Troubleshoot printing, paper jams,
            connection and quality problems.
          </p>
        </div>

        <div className="service-card">
          <div className="service-icon">
            📱
          </div>

          <h3>Mobile Devices</h3>

          <p>
            Get support for charging, battery,
            screen, camera and other issues.
          </p>
        </div>

        <div className="service-card">
          <div className="service-icon">
            📡
          </div>

          <h3>Network Devices</h3>

          <p>
            Get assistance with routers,
            Wi-Fi and connection problems.
          </p>
        </div>

      </div>
    </section>
  );
}

export default Services;