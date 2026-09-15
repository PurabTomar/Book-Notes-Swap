import { Routes, Route, NavLink, Link } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import NewListingPage from "./pages/NewListingPage.jsx";
import ListingDetailPage from "./pages/ListingDetailPage.jsx";

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <div className="header__inner">
          <Link to="/" className="brand">
            <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
              <rect width="32" height="32" rx="8" fill="#2563eb" />
              <path d="M10 9h8a4 4 0 0 1 4 4v10l-3-2-3 2-3-2-3 2V13a4 4 0 0 1 4-4z" fill="#fff" />
              <path d="M13 13h6M13 16h6M13 19h4" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <span className="brand__text">
              Book <span className="brand__amp">&amp;</span> Notes Swap
            </span>
          </Link>

          <nav className="nav">
            <NavLink to="/" end className={({ isActive }) => `nav__link ${isActive ? "nav__link--active" : ""}`}>
              Browse
            </NavLink>
            <Link to="/new" className="btn btn--primary btn--sm">
              + Post a Listing
            </Link>
          </nav>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/new" element={<NewListingPage />} />
        <Route path="/listing/:id" element={<ListingDetailPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>

      <footer className="footer">
        <p>Built for campus students — buy, sell &amp; give away books and notes.</p>
      </footer>
    </div>
  );
}