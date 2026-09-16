import { Routes, Route, NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase.js";
import { useAuth } from "./lib/AuthContext.jsx";
import HomePage from "./pages/HomePage.jsx";
import BrowsePage from "./pages/BrowsePage.jsx";
import NewListingPage from "./pages/NewListingPage.jsx";
import ListingDetailPage from "./pages/ListingDetailPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import ConversationPage from "./pages/ConversationPage.jsx";
import MyListingsPage from "./pages/MyListingsPage.jsx";
import GuidelinesPage from "./pages/GuidelinesPage.jsx";
import EditListingPage from "./pages/EditListingPage.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";

function HomeIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  );
}

function BrowseIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function ChatIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z" />
    </svg>
  );
}

function ProfileIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </svg>
  );
}

function AppInner() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const isDetail = location.pathname.startsWith("/listing/");

  const displayName = profile?.display_name || (user?.email ? user.email.split("@")[0] : null);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  return (
    <div className="app">
      {!isDetail && (
        <header className="header">
          <div className="header__inner">
            <Link to="/" className="brand">
              <div className="brand__icon">
                <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="#5B5CF0" />
                  <path d="M10 9h8a4 4 0 0 1 4 4v10l-3-2-3 2-3-2-3 2V13a4 4 0 0 1 4-4z" fill="#fff" />
                  <path d="M13 13h6M13 16h6M13 19h4" stroke="#5B5CF0" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>
              <span className="brand__text">
                Book <span className="brand__amp">&amp;</span> Notes Swap
              </span>
            </Link>

            <nav className="nav-desktop">
              <NavLink to="/" end className={({ isActive }) => `nav__link ${isActive ? "nav__link--active" : ""}`}>
                Home
              </NavLink>
              <NavLink to="/browse" className={({ isActive }) => `nav__link ${isActive ? "nav__link--active" : ""}`}>
                Browse
              </NavLink>
              <NavLink to="/chat" className={({ isActive }) => `nav__link ${isActive ? "nav__link--active" : ""}`}>
                Chat
              </NavLink>
              {user && (
                <NavLink to="/my-listings" className={({ isActive }) => `nav__link ${isActive ? "nav__link--active" : ""}`}>
                  My Listings
                </NavLink>
              )}
            </nav>

            <div className="header__actions">
              <ThemeToggle />
              {loading ? null : user ? (
                <>
                  <span className="header-user">
                    {displayName}
                    {profile?.is_sat_verified && <span className="verified-badge" title="SATI Verified"> ✓</span>}
                  </span>
                  <Link to="/new" className="btn btn--primary btn--sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                    Share Resource
                  </Link>
                  <button className="btn btn--sm btn--ghost" onClick={handleLogout} title="Sign out">
                    <LogoutIcon />
                  </button>
                </>
              ) : (
                <>
                  <Link to="/new" className="btn btn--primary btn--sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                    Share Resource
                  </Link>
                  <Link to="/auth" className="btn btn--sm btn--ghost">Sign in</Link>
                </>
              )}
            </div>
          </div>
        </header>
      )}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/new" element={<NewListingPage />} />
        <Route path="/listing/:id" element={<ListingDetailPage />} />
        <Route path="/listing/:id/edit" element={<EditListingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:id" element={<ConversationPage />} />
        <Route path="/my-listings" element={<MyListingsPage />} />
        <Route path="/guidelines" element={<GuidelinesPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>

      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__brand">
            <strong>Book &amp; Notes Swap</strong>
            <p>Free academic resources for SATI students. Share, discover, learn.</p>
          </div>
          <div className="footer__links">
            <Link to="/browse">Browse</Link>
            <Link to="/new">Share a resource</Link>
            <Link to="/guidelines">Guidelines</Link>
          </div>
          <div className="footer__links">
            <Link to="/guidelines">How it works</Link>
            <Link to="/my-listings">My Listings</Link>
            <a href="mailto:hello@booknoteswap.example?subject=Feedback">Give feedback</a>
            <a href="mailto:hello@booknoteswap.example?subject=Report%20a%20bug">Report a bug</a>
          </div>
        </div>
        <p className="footer__legal">
          Made for SATI students. All listings are free to swap.
        </p>
      </footer>

      <nav className="mobile-nav">
        <NavLink to="/" end className={({ isActive }) => `mobile-nav__item ${isActive ? "mobile-nav__item--active" : ""}`}>
          <HomeIcon active={location.pathname === "/"} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/browse" className={({ isActive }) => `mobile-nav__item ${isActive ? "mobile-nav__item--active" : ""}`}>
          <BrowseIcon active={location.pathname === "/browse"} />
          <span>Browse</span>
        </NavLink>
        <Link to="/new" className="mobile-nav__fab">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        </Link>
        <NavLink to="/chat" className={({ isActive }) => `mobile-nav__item ${isActive ? "mobile-nav__item--active" : ""}`}>
          <ChatIcon active={location.pathname === "/chat"} />
          <span>Chat</span>
        </NavLink>
        <NavLink to={user ? "/my-listings" : "/auth"} className={({ isActive }) => `mobile-nav__item ${isActive ? "mobile-nav__item--active" : ""}`}>
          <ProfileIcon active={location.pathname === "/my-listings" || location.pathname === "/auth"} />
          {user ? <span>Mine</span> : <span>Sign in</span>}
        </NavLink>
      </nav>
    </div>
  );
}

export default function App() {
  return <AppInner />;
}