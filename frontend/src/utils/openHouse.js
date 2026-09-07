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