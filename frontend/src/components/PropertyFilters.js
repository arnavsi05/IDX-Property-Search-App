import { useState } from "react";

const initialFilters = {
  city: "",
  zipcode: "",
  minPrice: "",
  maxPrice: "",
  beds: "",
  baths: "",
};

function PropertyFilters({ onSearch }) {
  const [filters, setFilters] = useState(initialFilters);

  function handleChange(event) {
    const { name, value } = event.target;

    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== "")
    );

    onSearch(cleanedFilters);
  }

  function handleClear() {
    setFilters(initialFilters);
    onSearch({});
  }

  return (
    <form className="filters" onSubmit={handleSubmit}>
      <div className="filter-field">
        <label htmlFor="city">City</label>
        <input
          id="city"
          name="city"
          type="text"
          value={filters.city}
          onChange={handleChange}
          placeholder="e.g. Los Angeles"
        />
      </div>

      <div className="filter-field">
        <label htmlFor="zipcode">ZIP Code</label>
        <input
          id="zipcode"
          name="zipcode"
          type="text"
          value={filters.zipcode}
          onChange={handleChange}
          placeholder="e.g. 97201"
        />
      </div>

      <div className="filter-field">
        <label htmlFor="minPrice">Min Price</label>
        <input
          id="minPrice"
          name="minPrice"
          type="number"
          min="0"
          value={filters.minPrice}
          onChange={handleChange}
          placeholder="300000"
        />
      </div>

      <div className="filter-field">
        <label htmlFor="maxPrice">Max Price</label>
        <input
          id="maxPrice"
          name="maxPrice"
          type="number"
          min="0"
          value={filters.maxPrice}
          onChange={handleChange}
          placeholder="500000"
        />
      </div>

      <div className="filter-field">
        <label htmlFor="beds">Beds</label>
        <select
          id="beds"
          name="beds"
          value={filters.beds}
          onChange={handleChange}
        >
          <option value="">Any</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
          <option value="5">5+</option>
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="baths">Baths</label>
        <select
          id="baths"
          name="baths"
          value={filters.baths}
          onChange={handleChange}
        >
          <option value="">Any</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
          <option value="5">5+</option>
        </select>
      </div>

      <div className="filter-actions">
        <button type="submit">Search</button>

        <button type="button" onClick={handleClear}>
          Clear Filters
        </button>
      </div>
    </form>
  );
}

export default PropertyFilters;