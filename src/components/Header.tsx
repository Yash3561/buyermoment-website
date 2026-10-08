import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Brand } from "./Brand";
import { BookingLink } from "./BookingLink";
import { Appearance } from "./Appearance";
export function Header({ path = "/" }: { path?: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  return (
    <header className="site-header">
      <div className="container nav-inner">
        <Brand />
        <nav
          id="primary-navigation"
          className={`nav-links ${open ? "is-open" : ""}`}
          aria-label="Main navigation"
        >
          {[
            ["/#services", "Services"],
            ["/sample-report", "Audit scope"],
            ["/#process", "Our process"],
            ["/audit", "Free audit"],
          ].map(([id, label]) => (
            <a
              href={id}
              key={id}
              aria-current={path === id ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {label}
            </a>
          ))}
          <a
            className="mobile-contact-link"
            href="/book"
            onClick={() => setOpen(false)}
          >
            Talk to the team
          </a>
        </nav>
        <Appearance />
        <BookingLink className="button button-small nav-contact" />
        <button
          className="menu-toggle"
          aria-controls="primary-navigation"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
