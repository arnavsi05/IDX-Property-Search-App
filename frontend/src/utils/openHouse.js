// OpenHouseRemarks isn't its own column — it's a key inside the all_data
// JSON blob that rets_openhouse returns as-is, so parsing happens here on
// the frontend rather than in the API.
export function getOpenHouseRemarks(allData) {
  if (!allData) {
    return "";
  }

  try {
    const parsed = JSON.parse(allData);

    return parsed.OpenHouseRemarks || "";
  } catch {
    return "";
  }
}