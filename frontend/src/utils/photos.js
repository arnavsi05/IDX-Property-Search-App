// L_Photos is stored as a JSON string, but some rows have null, an empty
// string, or a malformed/non-array value instead of a real photo array —
// so every failure mode here falls back to [] rather than throwing.
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