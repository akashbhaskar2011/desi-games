import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <Link to="/" className="brand">
            <span className="brand-mark">✦</span>
            <span>
              desi<span className="brand-accent">games</span>
            </span>
          </Link>
          <p className="footer-copy">
            Old games. New energy.
            <br />
            Made for the whole family.
          </p>
        </div>
        <div className="footer-links">
          <Link to="/games">
            All games <ArrowUpRight size={14} />
          </Link>
          <Link to="/how-to-play">
            How to play <ArrowUpRight size={14} />
          </Link>
        </div>
        <p className="footer-note">
          © 2026 Desi Games
          <br />
          Built with care in India.
        </p>
      </div>
    </footer>
  );
}
