import { useEffect, useState } from "react";
import { parsePhotos } from "../utils/photos";

function PropertyImageGallery({ photoData, address }) {
  const photos = parsePhotos(photoData);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  function showPrevious() {
    setCurrentIndex((current) =>
      current === 0
        ? photos.length - 1
        : current - 1
    );
  }

  function showNext() {
    setCurrentIndex((current) =>
      current === photos.length - 1
        ? 0
        : current + 1
    );
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if (!lightboxOpen) {
        return;
      }

      if (event.key === "Escape") {
        setLightboxOpen(false);
      }

      if (event.key === "ArrowLeft") {
        setCurrentIndex((current) =>
          current === 0 ? photos.length - 1 : current - 1
        );
      }

      if (event.key === "ArrowRight") {
        setCurrentIndex((current) =>
          current === photos.length - 1 ? 0 : current + 1
        );
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [lightboxOpen, photos.length]);

  if (photos.length === 0) {
    return (
      <div className="gallery-placeholder">
        No photos available
      </div>
    );
  }

  return (
    <>
      <section className="property-gallery">
        <img
          className="gallery-main-image"
          src={photos[currentIndex]}
          alt={address || "Property"}
          onClick={() => setLightboxOpen(true)}
        />

        {photos.length > 1 && (
          <>
            <button
              className="gallery-arrow gallery-arrow-left"
              onClick={showPrevious}
            >
              ←
            </button>

            <button
              className="gallery-arrow gallery-arrow-right"
              onClick={showNext}
            >
              →
            </button>

            <p className="gallery-counter">
              {currentIndex + 1} / {photos.length}
            </p>
          </>
        )}

        <div className="thumbnail-strip">
          {photos.map((photo, index) => (
            <button
              key={`${photo}-${index}`}
              className={
                index === currentIndex
                  ? "thumbnail active-thumbnail"
                  : "thumbnail"
              }
              onClick={() => setCurrentIndex(index)}
            >
              <img
                src={photo}
                alt={`Property ${index + 1}`}
              />
            </button>
          ))}
        </div>
      </section>

      {lightboxOpen && (
        <div
          className="lightbox"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="lightbox-content"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="lightbox-close"
              onClick={() => setLightboxOpen(false)}
            >
              ×
            </button>

            {photos.length > 1 && (
              <button
                className="lightbox-left"
                onClick={showPrevious}
              >
                ←
              </button>
            )}

            <img
              src={photos[currentIndex]}
              alt={address || "Property"}
            />

            {photos.length > 1 && (
              <button
                className="lightbox-right"
                onClick={showNext}
              >
                →
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default PropertyImageGallery;