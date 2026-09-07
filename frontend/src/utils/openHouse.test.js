import { getOpenHouseRemarks } from "./openHouse";

describe("getOpenHouseRemarks", () => {
  test("returns an empty string for null or undefined", () => {
    expect(getOpenHouseRemarks(null)).toBe("");
    expect(getOpenHouseRemarks(undefined)).toBe("");
  });

  test("returns an empty string for malformed JSON", () => {
    expect(getOpenHouseRemarks("not json")).toBe("");
  });

  test("returns an empty string when OpenHouseRemarks is missing", () => {
    expect(getOpenHouseRemarks(JSON.stringify({ OtherField: "x" }))).toBe("");
  });

  test("extracts OpenHouseRemarks from the all_data JSON blob", () => {
    const raw = JSON.stringify({ OpenHouseRemarks: "Bring an offer!" });
    expect(getOpenHouseRemarks(raw)).toBe("Bring an offer!");
  });
});
