import { Link } from "react-router-dom";
import PropertyImageCarousel from "./PropertyImageCarousel";
import { useFavorites } from "../hooks/useFavorites";

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
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(property.L_ListingID);

  const beds = property.L_Keyword2;
  const baths = property.LM_Dec_3;
  const sqft = property.LM_Int2_3;

  function handleFavoriteClick(event) {
    event.preventDefault();
    event.stopPropagation();
    toggleFavorite(property.L_ListingID);
  }

  return (
    <Link
      to={`/property/${property.L_ListingID}`}
      className="property-card"
    >
      <div className="property-card-media">
        <PropertyImageCarousel
          photoData={property.L_Photos}
          address={property.L_Address}
        />

        <button
          type="button"
          className={favorited ? "favorite-button favorited" : "favorite-button"}
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={favorited}
          onClick={handleFavoriteClick}
        >
          {favorited ? "♥" : "♡"}
        </button>
      </div>

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
    </Link>
  );
}

export default PropertyCard;