import { useEffect, useState } from "react";
import { fetchProperties } from "../api/client";
import PropertyCard from "../components/PropertyCard";
import PropertyFilters from "../components/PropertyFilters";

function ListingsPage() {
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProperties() {
      try {
        setLoading(true);
        setError("");

        const data = await fetchProperties({
          ...filters,
          limit: 20,
          offset: 0,
        });

        if (!cancelled) {
          setProperties(data.results);
          setTotal(data.total);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProperties();

    return () => {
      cancelled = true;
    };
  }, [filters]);

  function handleSearch(newFilters) {
    setFilters(newFilters);
  }

  return (
    <main className="page">
      <header className="page-header">
        <h1>Property Search</h1>
      </header>

      <PropertyFilters onSearch={handleSearch} />

      {loading && <p>Loading properties...</p>}

      {error && <p className="error-message">Error: {error}</p>}

      {!loading && !error && properties.length === 0 && (
        <p>No properties found. Try changing your filters.</p>
      )}

      {!loading && !error && properties.length > 0 && (
        <>
          <p>
            Showing {properties.length} of {total} properties
          </p>

          <section className="property-grid">
            {properties.map((property) => (
              <PropertyCard
                key={property.L_ListingID}
                property={property}
              />
            ))}
          </section>
        </>
      )}
    </main>
  );
}

export default ListingsPage;