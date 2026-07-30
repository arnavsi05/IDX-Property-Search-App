function parsePhotos(photoValue) {
  if (!photoValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(photoValue);

    if (Array.isArray(parsed)) {
      return parsed.filter((url) => typeof url === "string" && url.trim() !== "");
    }

    return [];
  } catch {
    return [];
  }
}

function formatPrice(price) {
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return "Price unavailable";
  }

  return numericPrice.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function PropertyCard({ property }) {
  const photos = parsePhotos(property.L_Photos);
  const firstPhoto = photos[0];

  const beds = property.L_Keyword2;
  const baths = property.LM_Dec_3;
  const sqft = property.LM_Int2_3;

  return (
    <article className="property-card">
      {firstPhoto ? (
        <img
          className="property-card-image"
          src={firstPhoto}
          alt={property.L_Address || "Property"}
        />
      ) : (
        <div className="property-card-placeholder">No photo available</div>
      )}

      <div className="property-card-content">
        <h2>{formatPrice(property.L_SystemPrice)}</h2>

        <p className="property-address">
          {property.L_Address || "Address unavailable"}
        </p>

        <p className="property-location">
          {[property.L_City, property.L_State, property.L_Zip]
            .filter(Boolean)
            .join(", ")}
        </p>

        <p className="property-stats">
          {beds ? `${beds} beds` : "Beds unavailable"} ·{" "}
          {baths ? `${baths} baths` : "Baths unavailable"} ·{" "}
          {sqft ? `${sqft} sqft` : "Sqft unavailable"}
        </p>
      </div>
    </article>
  );
}

export default PropertyCard;