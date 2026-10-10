import { Link } from "react-router-dom";

function MyTickets() {
  return (
    <div className="tickets-page">

      {/* HEADER */}
      <header className="tickets-header">

        <Link
          to="/customer/dashboard"
          className="tickets-logo"
        >
          <div className="tickets-logo-icon">
            TC
          </div>

          <div>
            <strong>TechCare</strong>
            <span>Hardware Support</span>
          </div>
        </Link>

        <Link
          to="/customer/dashboard"
          className="tickets-back"
        >
          ← Back to Dashboard
        </Link>

      </header>


      {/* MAIN */}
      <main className="tickets-main">

        <div className="tickets-title">

          <p>TECHCARE SUPPORT</p>

          <h1>My Tickets</h1>

          <span>
            View and track all your hardware support requests.
          </span>

        </div>


        {/* FILTERS */}
        <div className="tickets-filters">

          <button className="ticket-filter active">
            All
          </button>

          <button className="ticket-filter">
            Open
          </button>

          <button className="ticket-filter">
            In Progress
          </button>

          <button className="ticket-filter">
            Resolved
          </button>

          <button className="ticket-filter">
            Closed
          </button>

        </div>


        {/* TICKET CARD */}
        <div className="tickets-card">

          {/* EMPTY STATE */}

          <div className="tickets-empty">

            <div className="tickets-empty-icon">
              ▣
            </div>

            <h2>No tickets yet</h2>

            <p>
              You haven't submitted any hardware
              support requests yet.
            </p>

            <Link
              to="/customer/report-problem"
              className="tickets-report-btn"
            >
              + Report a Problem
            </Link>

          </div>

        </div>

      </main>

    </div>
  );
}

export default MyTickets;