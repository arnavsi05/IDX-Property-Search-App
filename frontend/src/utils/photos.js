export function parsePhotos(photoValue) {
  if (!photoValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(photoValue);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (photo) =>
        typeof photo === "string" &&
        photo.trim() !== ""
    );
  } catch {
    return [];
  }
}