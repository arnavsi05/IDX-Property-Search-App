export const SORT_OPTIONS = [
  { value: "", label: "Sort: Default" },
  { value: "L_SystemPrice:ASC", label: "Price: Low to High" },
  { value: "L_SystemPrice:DESC", label: "Price: High to Low" },
  { value: "ListingContractDate:DESC", label: "Newest Listed" },
  { value: "LM_Int2_3:DESC", label: "Square Footage: High to Low" },
  { value: "L_Keyword2:DESC", label: "Most Bedrooms" },
];

function SortSelect({ value, onChange }) {
  return (
    <div className="sort-select">
      <label htmlFor="sort">Sort By</label>

      <select
        id="sort"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SortSelect;
