import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchPropertyDetail } from "../api/client";
import PropertyCard from "../components/PropertyCard";
import { useFavorites } from "../hooks/useFavorites";

function FavoritesPage() {
  const { favoriteIds } = useFavorites();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (favoriteIds.length === 0) {
      setProperties([]);
      setLoading(false);
      return undefined;
    }

    async function loadFavorites() {
      setLoading(true);

      const results = await Promise.all(
        favoriteIds.map((id) => fetchPropertyDetail(id).catch(() => null))
      );

      if (!cancelled) {
        setProperties(results.filter(Boolean));
        setLoading(false);
      }
    }

    loadFavorites();

    return () => {
      cancelled = true;
    };
  }, [favoriteIds]);

  return (
    <main className="page">
      <header className="page-header">
        <h1>Favorites</h1>
        <p>
          {favoriteIds.length} saved{" "}
          {favoriteIds.length === 1 ? "property" : "properties"}
        </p>
      </header>

      {loading && <p>Loading favorites...</p>}

      {!loading && properties.length === 0 && (
        <p>
          You haven&apos;t favorited any properties yet.{" "}
          <Link to="/">Browse listings</Link>.
        </p>
      )}

      {!loading && properties.length > 0 && (
        <section className="property-grid">
          {properties.map((property) => (
            <PropertyCard key={property.L_ListingID} property={property} />
          ))}
        </section>
      )}
    </main>
  );
}

export default FavoritesPage;
