import { Routes, Route, NavLink, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import HomePage from "./pages/HomePage.jsx";
import BrowsePage from "./pages/BrowsePage.jsx";
import NewListingPage from "./pages/NewListingPage.jsx";
import ListingDetailPage from "./pages/ListingDetailPage.jsx";

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
  );
}

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

export default function App() {
  const location = useLocation();
  const isDetail = location.pathname.startsWith("/listing/");

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
            </nav>

            <div className="header__actions">
              <Link to="/new" className="btn btn--primary btn--sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                Share Resource
              </Link>
            </div>
          </div>
        </header>
      )}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/new" element={<NewListingPage />} />
        <Route path="/listing/:id" element={<ListingDetailPage />} />
        <Route path="/chat" element={<div className="page" style={{ textAlign: "center", paddingTop: 80 }}><h2 className="page__title">Chat</h2><p className="page__subtitle" style={{ marginTop: 8 }}>Student conversations coming soon.</p></div>} />
        <Route path="/profile" element={<div className="page" style={{ textAlign: "center", paddingTop: 80 }}><h2 className="page__title">Profile</h2><p className="page__subtitle" style={{ marginTop: 8 }}>Student profiles coming soon.</p></div>} />
        <Route path="*" element={<HomePage />} />
      </Routes>

      <footer className="footer">
        <p>Book &amp; Notes Swap &mdash; Free academic resources for SATI students.</p>
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
        <NavLink to="/profile" className={({ isActive }) => `mobile-nav__item ${isActive ? "mobile-nav__item--active" : ""}`}>
          <ProfileIcon active={location.pathname === "/profile"} />
          <span>Profile</span>
        </NavLink>
      </nav>
    </div>
  );
}