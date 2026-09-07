import { useState } from "react";
import { parsePhotos } from "../utils/photos";

function PropertyImageCarousel({ photoData, address }) {
  const photos = parsePhotos(photoData);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="property-card-placeholder">No photo available</div>
    );
  }

  function showPrevious(event) {
    event.preventDefault();
    event.stopPropagation();

    setCurrentIndex((current) =>
      current === 0 ? photos.length - 1 : current - 1
    );
  }

  function showNext(event) {
    event.preventDefault();
    event.stopPropagation();

    setCurrentIndex((current) =>
      current === photos.length - 1 ? 0 : current + 1
    );
  }

  return (
    <div className="property-card-carousel">
      <img
        className="property-card-image"
        src={photos[currentIndex]}
        alt={address || "Property"}
      />

      {photos.length > 1 && (
        <>
          <button
            type="button"
            className="carousel-arrow carousel-arrow-left"
            aria-label="Previous photo"
            onClick={showPrevious}
          >
            ←
          </button>

          <button
            type="button"
            className="carousel-arrow carousel-arrow-right"
            aria-label="Next photo"
            onClick={showNext}
          >
            →
          </button>

          <span className="carousel-counter">
            {currentIndex + 1} / {photos.length}
          </span>
        </>
      )}
    </div>
  );
}

export default PropertyImageCarousel;
