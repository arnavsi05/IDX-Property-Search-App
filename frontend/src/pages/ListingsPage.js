import { useEffect, useState } from "react";
import { fetchProperties } from "../api/client";
import PropertyCard from "../components/PropertyCard";

function ListingsPage() {
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProperties() {
      try {
        setLoading(true);
        setError("");

        const data = await fetchProperties({
          limit,
          offset,
        });

        setProperties(data.results);
        setTotal(data.total);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadProperties();
  }, [limit, offset]);

  if (loading) {
    return (
      <main className="page">
        <h1>Property Search</h1>
        <p>Loading properties...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page">
        <h1>Property Search</h1>
        <p className="error-message">Error: {error}</p>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="page-header">
        <h1>Property Search</h1>
        <p>
          Showing {properties.length} of {total} properties
        </p>
      </header>

      <section className="property-grid">
        {properties.map((property) => (
          <PropertyCard
            key={property.L_ListingID}
            property={property}
          />
        ))}
      </section>
    </main>
  );
}

export default ListingsPage;