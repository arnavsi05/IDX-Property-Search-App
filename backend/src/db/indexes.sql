-- Indexes on rets_property, in the order they were added across the project.
-- The table has a legacy zero-date default on `active_check` that trips
-- STRICT_TRANS_TABLES/NO_ZERO_DATE during ALTER/CREATE INDEX (error 1067).
-- Run `SET SESSION sql_mode = '';` first if you hit that.

-- Week 3: single-column indexes for the basic filters
CREATE INDEX idx_property_city ON rets_property (L_City);
CREATE INDEX idx_property_zip ON rets_property (L_Zip);
CREATE INDEX idx_property_price ON rets_property (L_SystemPrice);
CREATE INDEX idx_property_beds ON rets_property (L_Keyword2);
CREATE INDEX idx_property_baths ON rets_property (LM_Dec_3);

-- Week 3: composite index for the most common combined filter (city + price + beds)
CREATE INDEX idx_property_city_price_beds ON rets_property (L_City, L_SystemPrice, L_Keyword2);

-- Week 9: indexes to support the new sortBy columns (square footage, date listed)
-- so ORDER BY can use an index scan instead of a filesort.
CREATE INDEX idx_property_sqft ON rets_property (LM_Int2_3);
CREATE INDEX idx_property_listdate ON rets_property (ListingContractDate);
CREATE INDEX idx_property_price_listdate ON rets_property (L_SystemPrice, ListingContractDate);
