function PropertyMap({ latitude, longitude, address }) {
  const lat = Number(latitude);
  const lng = Number(longitude);

  const hasValidCoordinates =
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    !(lat === 0 && lng === 0);

  if (!hasValidCoordinates) {
    return null;
  }

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <section className="property-detail-section property-map">
      <h2>Location</h2>

      {apiKey ? (
        <iframe
          title={address ? `Map of ${address}` : "Property location map"}
          className="property-map-frame"
          loading="lazy"
          allowFullScreen
          src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&zoom=15`}
        />
      ) : (
        <p className="property-map-fallback">
          Map unavailable — REACT_APP_GOOGLE_MAPS_API_KEY is not configured.
        </p>
      )}

      <a
        className="get-directions-link"
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        Get Directions
      </a>
    </section>
  );
}

export default PropertyMap;
