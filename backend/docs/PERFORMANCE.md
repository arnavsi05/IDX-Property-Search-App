# Query Performance Notes

## EXPLAIN column reference

Ran against `GET /api/properties` with `city`, `minPrice`, `beds` filters and a
`sortBy=LM_Int2_3` (square footage) sort — the most complex query the endpoint
builds, since it combines a `WHERE` on three columns with an `ORDER BY` on a
fourth.

| Column | Meaning |
|---|---|
| `select_type` | Query type (`SIMPLE` = no subqueries/unions). |
| `table` | Which table this row of the plan refers to. |
| `type` | Join/access strategy, worst to best: `ALL` (full table scan), `index` (full index scan), `range` (index range scan, e.g. `>=`), `ref`/`eq_ref` (index lookup), `const`. We want to avoid `ALL`. |
| `possible_keys` | Indexes MySQL considered. |
| `key` | Index MySQL actually chose. `NULL` means no index was used. |
| `key_len` | Bytes of the index actually used — tells you if a composite index was used fully or only its leading column(s). |
| `rows` | Estimated rows MySQL expects to examine. Lower is better. |
| `filtered` | Estimated % of those rows that survive the `WHERE` after the index narrows things down. |
| `Extra` | Notable extras. `Using filesort` = MySQL had to sort results outside of any index (expensive on large result sets); `Using index condition` = index used to filter before reading rows; `Using where` = an extra filter applied after the index lookup. |

## Before adding Week 9 indexes

```
EXPLAIN SELECT ... FROM rets_property
WHERE LOWER(TRIM(L_City)) = LOWER(TRIM('Los Angeles'))
  AND L_SystemPrice >= 300000 AND L_Keyword2 >= 3
ORDER BY LM_Int2_3 DESC, L_ListingID ASC
LIMIT 20 OFFSET 0;
```

| type | key | rows | Extra |
|---|---|---|---|
| range | idx_property_price | 18842 | Using index condition; Using where; Using MRR; **Using filesort** |

Two findings:

1. **`Using filesort`** — no index covers `LM_Int2_3` (square footage), so once
   MySQL narrows rows down by price it still has to sort ~18k rows in memory
   before applying `LIMIT 20`. Same problem exists for `ListingContractDate`
   (date listed), the other new sort option.
2. **`idx_property_city` never appears in `possible_keys`.** Wrapping the
   column in `LOWER(TRIM(L_City))` (done in `buildPropertyFilters` to handle
   the inconsistent casing in the source data — see Appendix A of the
   project guide) makes the comparison non-sargable, so MySQL can't use the
   city index at all here even though one exists. This predates Week 9 and
   is left as-is since fixing it would mean changing the query-building
   approach (e.g. a generated/normalized column) — noted here as a known
   improvement for later rather than changed now.

## After adding Week 9 indexes

Added (see [`src/db/indexes.sql`](../src/db/indexes.sql)):

```sql
CREATE INDEX idx_property_sqft ON rets_property (LM_Int2_3);
CREATE INDEX idx_property_listdate ON rets_property (ListingContractDate);
CREATE INDEX idx_property_price_listdate ON rets_property (L_SystemPrice, ListingContractDate);
```

Same query family, re-explained:

```
EXPLAIN SELECT L_ListingID FROM rets_property
WHERE L_SystemPrice >= 300000
ORDER BY ListingContractDate DESC LIMIT 20 OFFSET 0;
```

| type | key | rows | Extra |
|---|---|---|---|
| index | idx_property_listdate | 40 | Using where; Backward index scan |

```
EXPLAIN SELECT L_ListingID FROM rets_property
WHERE L_Keyword2 >= 3
ORDER BY LM_Int2_3 DESC LIMIT 20 OFFSET 0;
```

| type | key | rows | Extra |
|---|---|---|---|
| index | idx_property_sqft | 40 | Using where; Backward index scan |

`Using filesort` is gone in both cases — MySQL walks the new index in
reverse order and stops after `LIMIT 20` rows instead of sorting the whole
filtered set. Estimated rows examined dropped from ~18,842 to 40.

## Note on `CREATE INDEX` and `active_check`

`rets_property.active_check` has a `0000-00-00 00:00:00` default, which trips
`NO_ZERO_DATE`/`STRICT_TRANS_TABLES` on any `ALTER TABLE` (including
`CREATE INDEX`, which is an `ALTER TABLE` under the hood) with an error like:

```
ERROR 1067 (42000): Invalid default value for 'active_check'
```

Work around it per-session without touching the server's global mode:

```sql
SET SESSION sql_mode = '';
CREATE INDEX ...;
```
