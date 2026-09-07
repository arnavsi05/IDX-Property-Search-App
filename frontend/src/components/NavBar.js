import { Link } from "react-router-dom";
import { useFavorites } from "../hooks/useFavorites";

function NavBar() {
  const { favoriteIds } = useFavorites();

  return (
    <nav className="site-nav">
      <Link to="/" className="site-nav-brand">
        IDX Property Search
      </Link>

      <Link to="/favorites" className="site-nav-link">
        ♥ Favorites ({favoriteIds.length})
      </Link>
    </nav>
  );
}

export default NavBar;
