import { useEffect, useState } from "react";
import { fetchProperties } from "../api/client";
import PropertyCard from "../components/PropertyCard";
import PropertyFilters from "../components/PropertyFilters";
import Pagination from "../components/Pagination";
import SortSelect from "../components/SortSelect";

const ITEMS_PER_PAGE = 20;

function parseSortValue(sortValue) {
  if (!sortValue) {
    return {};
  }

  const [sortBy, sortOrder] = sortValue.split(":");
  return { sortBy, sortOrder };
}

function ListingsPage() {
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({});
  const [sortValue, setSortValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProperties() {
      try {
        setLoading(true);
        setError("");

        const offset = (currentPage - 1) * ITEMS_PER_PAGE;

        const data = await fetchProperties({
          ...filters,
          ...parseSortValue(sortValue),
          limit: ITEMS_PER_PAGE,
          offset,
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
  }, [filters, sortValue, currentPage]);

  // New filters reset both sort and page: a sort chosen for the old result
  // set may not make sense for the new one, and page 5 of the old set may
  // not exist in the new one. Sort itself only resets the page, since the
  // filters are still valid — just reordered.
  function handleSearch(newFilters) {
    setFilters(newFilters);
    setSortValue("");
    setCurrentPage(1);
  }

  function handleSortChange(newSortValue) {
    setSortValue(newSortValue);
    setCurrentPage(1);
  }

  function handlePageChange(page) {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const firstResult =
    total === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;

  const lastResult = Math.min(
    currentPage * ITEMS_PER_PAGE,
    total
  );

  return (
    <main className="page">
      <header className="page-header">
        <h1>Property Search</h1>
      </header>

      <PropertyFilters onSearch={handleSearch} />

      {loading && <p>Loading properties...</p>}

      {error && (
        <p className="error-message">
          Error: {error}
        </p>
      )}

      {!loading && !error && properties.length === 0 && (
        <p>
          No properties found. Try changing your filters.
        </p>
      )}

      {!loading && !error && properties.length > 0 && (
        <>
          <div className="listings-toolbar">
            <p>
              Showing {firstResult}-{lastResult} of {total} properties
            </p>

            <SortSelect value={sortValue} onChange={handleSortChange} />
          </div>

          <section className="property-grid">
            {properties.map((property) => (
              <PropertyCard
                key={property.L_ListingID}
                property={property}
              />
            ))}
          </section>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </main>
  );
}

export default ListingsPage;