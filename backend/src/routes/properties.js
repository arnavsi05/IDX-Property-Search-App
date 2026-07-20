const express = require("express");
const pool = require("../db/pool");

const router = express.Router();

function validateListingId(id) {
  if (!id || typeof id !== "string") {
    throw new Error("Listing ID is required");
  }

  const trimmedId = id.trim();

  if (trimmedId.length === 0) {
    throw new Error("Listing ID cannot be empty");
  }

  if (trimmedId.length > 50) {
    throw new Error("Listing ID is too long");
  }

  if (!/^[A-Za-z0-9_-]+$/.test(trimmedId)) {
    throw new Error("Listing ID contains invalid characters");
  }

  return trimmedId;
}

function parseLimit(value) {
  if (value === undefined) return 20;

  const limit = Number(value);

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new Error("limit must be an integer between 1 and 100");
  }

  return limit;
}

function parseOffset(value) {
  if (value === undefined) return 0;

  const offset = Number(value);

  if (!Number.isInteger(offset) || offset < 0) {
    throw new Error("offset must be an integer greater than or equal to 0");
  }

  return offset;
}

function parseNonNegativeNumber(value, fieldName) {
  if (value === undefined) return undefined;

  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    throw new Error(`${fieldName} must be a non-negative number`);
  }

  return number;
}

function parsePositiveInteger(value, fieldName) {
  if (value === undefined) return undefined;

  const number = Number(value);

  if (!Number.isInteger(number) || number < 1) {
    throw new Error(`${fieldName} must be a positive integer`);
  }

  return number;
}

function buildPropertyFilters(query) {
  const conditions = [];
  const values = [];

  const city = query.city?.trim();
  const zipcode = query.zipcode?.trim();

  const minPrice = parseNonNegativeNumber(query.minPrice, "minPrice");
  const maxPrice = parseNonNegativeNumber(query.maxPrice, "maxPrice");
  const beds = parsePositiveInteger(query.beds, "beds");
  const baths = parseNonNegativeNumber(query.baths, "baths");

  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    throw new Error("minPrice cannot be greater than maxPrice");
  }

  if (city !== undefined && city.length === 0) {
    throw new Error("city cannot be empty");
  }

  if (zipcode !== undefined && zipcode.length === 0) {
    throw new Error("zipcode cannot be empty");
  }

  if (city) {
    conditions.push("LOWER(TRIM(L_City)) = LOWER(TRIM(?))");
    values.push(city);
  }

  if (zipcode) {
    conditions.push("TRIM(L_Zip) = ?");
    values.push(zipcode);
  }

  if (minPrice !== undefined) {
    conditions.push("L_SystemPrice >= ?");
    values.push(minPrice);
  }

  if (maxPrice !== undefined) {
    conditions.push("L_SystemPrice <= ?");
    values.push(maxPrice);
  }

  if (beds !== undefined) {
    conditions.push("L_Keyword2 >= ?");
    values.push(beds);
  }

  if (baths !== undefined) {
    conditions.push("LM_Dec_3 >= ?");
    values.push(baths);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  return {
    whereClause,
    values,
  };
}

router.get("/", async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit);
    const offset = parseOffset(req.query.offset);

    const { whereClause, values } = buildPropertyFilters(req.query);

    const countSql = `
      SELECT COUNT(*) AS total
      FROM rets_property
      ${whereClause}
    `;

    const dataSql = `
    SELECT
        L_ListingID,
        L_Address,
        L_City,
        L_State,
        L_Zip,
        L_SystemPrice,
        L_Keyword2,
        LM_Dec_3,
        LM_Int2_3,
        L_Photos,
        LMD_MP_Latitude,
        LMD_MP_Longitude
    FROM rets_property
    ${whereClause}
    ORDER BY L_ListingID
    LIMIT ${limit}
    OFFSET ${offset}
    `;

    const [countRows] = await pool.execute(countSql, values);
    const [properties] = await pool.execute(dataSql, values);

    res.json({
      total: countRows[0].total,
      limit,
      offset,
      results: properties,
    });
  } catch (error) {
    if (
      error.message.includes("limit") ||
      error.message.includes("offset") ||
      error.message.includes("minPrice") ||
      error.message.includes("maxPrice") ||
      error.message.includes("beds") ||
      error.message.includes("baths") ||
      error.message.includes("city") ||
      error.message.includes("zipcode")
    ) {
      return res.status(400).json({
        error: error.message,
      });
    }

    console.error("Error fetching properties:", error);

    res.status(500).json({
      error: "Failed to fetch properties",
    });
  }
});

router.get("/:id/openhouses", async (req, res) => {
  try {
    const listingId = validateListingId(req.params.id);

    const [propertyRows] = await pool.execute(
      `
        SELECT L_ListingID
        FROM rets_property
        WHERE L_ListingID = ?
        LIMIT 1
      `,
      [listingId]
    );

    if (propertyRows.length === 0) {
      return res.status(404).json({
        error: "Property not found",
      });
    }

    const [openHouses] = await pool.execute(
      `
        SELECT
          L_ListingID,
          OpenHouseDate,
          OH_StartTime,
          OH_EndTime,
          all_data
        FROM rets_openhouse
        WHERE L_ListingID = ?
        ORDER BY OpenHouseDate ASC, OH_StartTime ASC
      `,
      [listingId]
    );

    res.json(openHouses);
  } catch (error) {
    if (error.message.includes("Listing ID")) {
      return res.status(400).json({
        error: error.message,
      });
    }

    console.error("Error fetching open houses:", error);

    res.status(500).json({
      error: "Failed to fetch open houses",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const listingId = validateListingId(req.params.id);

    const [rows] = await pool.execute(
      `
        SELECT
          L_ListingID,
          L_Address,
          L_City,
          L_State,
          L_Zip,
          L_SystemPrice,
          L_Keyword2,
          LM_Dec_3,
          LM_Int2_3,
          L_Photos,
          LMD_MP_Latitude,
          LMD_MP_Longitude,
          L_Remarks,
          YearBuilt,
          LotSizeAcres
        FROM rets_property
        WHERE L_ListingID = ?
        LIMIT 1
      `,
      [listingId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Property not found",
      });
    }

    res.json(rows[0]);
  } catch (error) {
    if (error.message.includes("Listing ID")) {
      return res.status(400).json({
        error: error.message,
      });
    }

    console.error("Error fetching property detail:", error);

    res.status(500).json({
      error: "Failed to fetch property detail",
    });
  }
});

module.exports = router;