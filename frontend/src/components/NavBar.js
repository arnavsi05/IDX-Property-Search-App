import { Link } from "react-router-dom";
import { useFavorites } from "../hooks/useFavorites";

function NavBar() {
  const { favoriteIds } = useFavorites();

  return (
    <nav className="site-nav">
      <Link to="/favorites" className="site-nav-link">
        <span className="favorite-icon" aria-hidden="true">&#9825;</span>
        Favorites <span className="favorite-count">{favoriteIds.length}</span>
      </Link>

      <Link to="/" className="site-nav-brand" aria-label="IDX Exchange home">
        <img
          className="site-nav-logo"
          src="/idxexchange-logo.png"
          alt="IDX Exchange"
        />
      </Link>
    </nav>
  );
}

export default NavBar;
