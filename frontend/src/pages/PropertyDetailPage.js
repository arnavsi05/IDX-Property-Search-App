import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import PropertyImageGallery from "../components/PropertyImageGallery";
import PropertyMap from "../components/PropertyMap";

import {
  fetchPropertyDetail,
  fetchOpenHouses,
} from "../api/client";

import {
  getOpenHouseRemarks,
} from "../utils/openHouse";

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

function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [openHouses, setOpenHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProperty() {
      try {
        setLoading(true);
        setError("");

        const [propertyData, openHouseData] =
          await Promise.all([
            fetchPropertyDetail(id),
            fetchOpenHouses(id),
          ]);

        setProperty(propertyData);
        setOpenHouses(openHouseData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadProperty();
  }, [id]);

  if (loading) {
    return (
      <main className="page">
        <p>Loading property...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page">
        <button onClick={() => navigate("/")}>
          ← Back to listings
        </button>

        <h1>Unable to load property</h1>

        <p className="error-message">
          {error}
        </p>
      </main>
    );
  }

  if (!property) {
    return null;
  }

  return (
    <main className="page property-detail">

      <button
        className="back-button"
        onClick={() => navigate("/")}
      >
        ← Back to listings
      </button>

      <PropertyImageGallery
        photoData={property.L_Photos}
        address={property.L_Address}
      />

      <h1>
        {formatPrice(property.L_SystemPrice)}
      </h1>

      <h2>
        {property.L_Address}
      </h2>

      <p>
        {property.L_City}, {property.L_State}{" "}
        {property.L_Zip}
      </p>

      <section className="property-detail-section">
        <h2>Property Overview</h2>

        <div className="property-details-grid">

          <div>
            <strong>Beds</strong>
            <span>
              {property.L_Keyword2 || "N/A"}
            </span>
          </div>

          <div>
            <strong>Baths</strong>
            <span>
              {property.LM_Dec_3 || "N/A"}
            </span>
          </div>

          <div>
            <strong>Square Feet</strong>
            <span>
              {property.LM_Int2_3 || "N/A"}
            </span>
          </div>

          <div>
            <strong>Year Built</strong>
            <span>
              {property.YearBuilt || "N/A"}
            </span>
          </div>

          <div>
            <strong>Lot Size</strong>
            <span>
              {property.LotSizeAcres
                ? `${property.LotSizeAcres} acres`
                : "N/A"}
            </span>
          </div>

        </div>
      </section>

      <section className="property-detail-section">
        <h2>Description</h2>

        <p>
          {property.L_Remarks ||
            "No description available."}
        </p>
      </section>

      <PropertyMap
        latitude={property.LMD_MP_Latitude}
        longitude={property.LMD_MP_Longitude}
        address={property.L_Address}
      />

      <section className="property-detail-section">
        <h2>Open Houses</h2>

        {openHouses.length === 0 ? (
          <p>No open houses scheduled.</p>
        ) : (
          <div className="open-house-list">

            {openHouses.map((openHouse, index) => {
              const remarks = getOpenHouseRemarks(
                openHouse.all_data
              );

              return (
                <div
                  className="open-house-card"
                  key={
                    openHouse.id ||
                    `${openHouse.L_ListingID}-${index}`
                  }
                >
                  <h3>
                    Open House
                  </h3>

                  <p>
                    <strong>Date:</strong>{" "}
                    {openHouse.OpenHouseDate ||
                      "Date unavailable"}
                  </p>

                  <p>
                    <strong>Time:</strong>{" "}
                    {openHouse.OH_StartTime ||
                      "Time unavailable"}
                    {" – "}
                    {openHouse.OH_EndTime ||
                      "Time unavailable"}
                  </p>

                  {remarks && (
                    <p className="open-house-remarks">
                      <strong>Remarks:</strong>{" "}
                      {remarks}
                    </p>
                  )}
                </div>
              );
            })}

          </div>
        )}
      </section>

    </main>
  );
}

export default PropertyDetailPage;