import { parsePhotos } from "./photos";

describe("parsePhotos", () => {
  test("returns an empty array for null, undefined, or empty string", () => {
    expect(parsePhotos(null)).toEqual([]);
    expect(parsePhotos(undefined)).toEqual([]);
    expect(parsePhotos("")).toEqual([]);
  });

  test("returns an empty array for malformed JSON", () => {
    expect(parsePhotos("not json")).toEqual([]);
  });

  test("returns an empty array when the JSON is not an array", () => {
    expect(parsePhotos(JSON.stringify({ photo: "one.jpg" }))).toEqual([]);
  });

  test("parses a valid JSON array of photo URLs", () => {
    const urls = ["one.jpg", "two.jpg"];
    expect(parsePhotos(JSON.stringify(urls))).toEqual(urls);
  });

  test("filters out non-string and blank entries", () => {
    const raw = JSON.stringify(["one.jpg", "", "  ", null, 42, "two.jpg"]);
    expect(parsePhotos(raw)).toEqual(["one.jpg", "two.jpg"]);
  });
});
