DROP MATERIALIZED VIEW IF EXISTS "public"."apartments_by_insee_code_month_slopes" CASCADE;
--> statement-breakpoint
DROP MATERIALIZED VIEW IF EXISTS "public"."houses_by_insee_code_month_slopes" CASCADE;
--> statement-breakpoint
DROP MATERIALIZED VIEW IF EXISTS "public"."apartments_by_section_month_slopes" CASCADE;
--> statement-breakpoint
DROP MATERIALIZED VIEW IF EXISTS "public"."houses_by_section_month_slopes" CASCADE;
--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."apartments_by_insee_code_month_slopes" AS (
  WITH latest_year AS (
    SELECT max("year") AS value
    FROM "public"."apartments_by_insee_code_month"
  )
  SELECT
    m."insee_code",
    (max(m."year") FILTER (WHERE m."year" = latest_year.value))::int AS "year",
    (max(m."month") FILTER (WHERE m."year" = latest_year.value))::int AS "month",
    count(*) FILTER (WHERE m."year" = latest_year.value)::int AS "window_months",
    latest_year.value AS "window_start_year",
    min(m."month") FILTER (WHERE m."year" = latest_year.value) AS "window_start_month",
    round(
      (
        regr_slope(
          m."total_sales"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "total_sales_slope",
    round(
      (
        regr_slope(
          m."total_price"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "total_price_slope",
    round(
      (
        regr_slope(
          m."avg_price"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "avg_price_slope",
    round(
      (
        regr_slope(
          m."total_area"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "total_area_slope",
    round(
      (
        regr_slope(
          m."avg_area"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "avg_area_slope",
    round(
      (
        regr_slope(
          m."avg_price_m2"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "avg_price_m2_slope",
    round(
      (
        regr_slope(
          m."min_price"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "min_price_slope",
    round(
      (
        regr_slope(
          m."max_price"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "max_price_slope",
    round(
      (
        regr_slope(
          m."median_price"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "median_price_slope",
    round(
      (
        regr_slope(
          m."median_area"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "median_area_slope",
    round(
      (
        regr_slope(
          m."min_price_m2"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "min_price_m2_slope",
    round(
      (
        regr_slope(
          m."max_price_m2"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "max_price_m2_slope",
    round(
      (
        regr_slope(
          m."price_m2_p25"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "price_m2_p25_slope",
    round(
      (
        regr_slope(
          m."price_m2_p75"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "price_m2_p75_slope",
    round(
      (
        regr_slope(
          m."price_m2_iqr"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "price_m2_iqr_slope",
    round(
      (
        regr_slope(
          m."price_m2_stddev"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "price_m2_stddev_slope",
    round(
      (
        regr_slope(
          m."total_apartments"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "total_apartments_slope",
    round(
      (
        regr_slope(
          m."apartment_1_room"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "apartment_1_room_slope",
    round(
      (
        regr_slope(
          m."apartment_2_room"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "apartment_2_room_slope",
    round(
      (
        regr_slope(
          m."apartment_3_room"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "apartment_3_room_slope",
    round(
      (
        regr_slope(
          m."apartment_4_room"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "apartment_4_room_slope",
    round(
      (
        regr_slope(
          m."apartment_5_room"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "apartment_5_room_slope"
  FROM
    "public"."apartments_by_insee_code_month" AS m
    CROSS JOIN latest_year
  GROUP BY
    m."insee_code",
    latest_year.value
  HAVING
    count(*) FILTER (WHERE m."year" = latest_year.value) > 0
);
--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."houses_by_insee_code_month_slopes" AS (
  WITH latest_year AS (
    SELECT max("year") AS value
    FROM "public"."houses_by_insee_code_month"
  )
  SELECT
    m."insee_code",
    (max(m."year") FILTER (WHERE m."year" = latest_year.value))::int AS "year",
    (max(m."month") FILTER (WHERE m."year" = latest_year.value))::int AS "month",
    count(*) FILTER (WHERE m."year" = latest_year.value)::int AS "window_months",
    latest_year.value AS "window_start_year",
    min(m."month") FILTER (WHERE m."year" = latest_year.value) AS "window_start_month",
    round(
      (
        regr_slope(
          m."total_sales"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "total_sales_slope",
    round(
      (
        regr_slope(
          m."total_price"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "total_price_slope",
    round(
      (
        regr_slope(
          m."avg_price"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "avg_price_slope",
    round(
      (
        regr_slope(
          m."total_area"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "total_area_slope",
    round(
      (
        regr_slope(
          m."avg_area"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "avg_area_slope",
    round(
      (
        regr_slope(
          m."avg_price_m2"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "avg_price_m2_slope",
    round(
      (
        regr_slope(
          m."min_price"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "min_price_slope",
    round(
      (
        regr_slope(
          m."max_price"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "max_price_slope",
    round(
      (
        regr_slope(
          m."median_price"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "median_price_slope",
    round(
      (
        regr_slope(
          m."median_area"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "median_area_slope",
    round(
      (
        regr_slope(
          m."min_price_m2"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "min_price_m2_slope",
    round(
      (
        regr_slope(
          m."max_price_m2"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "max_price_m2_slope",
    round(
      (
        regr_slope(
          m."price_m2_p25"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "price_m2_p25_slope",
    round(
      (
        regr_slope(
          m."price_m2_p75"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "price_m2_p75_slope",
    round(
      (
        regr_slope(
          m."price_m2_iqr"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "price_m2_iqr_slope",
    round(
      (
        regr_slope(
          m."price_m2_stddev"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "price_m2_stddev_slope",
    round(
      (
        regr_slope(
          m."total_houses"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "total_houses_slope",
    round(
      (
        regr_slope(
          m."house_1_room"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "house_1_room_slope",
    round(
      (
        regr_slope(
          m."house_2_room"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "house_2_room_slope",
    round(
      (
        regr_slope(
          m."house_3_room"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "house_3_room_slope",
    round(
      (
        regr_slope(
          m."house_4_room"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "house_4_room_slope",
    round(
      (
        regr_slope(
          m."house_5_room"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "house_5_room_slope"
  FROM
    "public"."houses_by_insee_code_month" AS m
    CROSS JOIN latest_year
  GROUP BY
    m."insee_code",
    latest_year.value
  HAVING
    count(*) FILTER (WHERE m."year" = latest_year.value) > 0
);
--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."apartments_by_section_month_slopes" AS (
  WITH latest_year AS (
    SELECT max("year") AS value
    FROM "public"."apartments_by_section_month"
  )
  SELECT
    m."insee_code",
    m."section",
    (max(m."year") FILTER (WHERE m."year" = latest_year.value))::int AS "year",
    (max(m."month") FILTER (WHERE m."year" = latest_year.value))::int AS "month",
    count(*) FILTER (WHERE m."year" = latest_year.value)::int AS "window_months",
    latest_year.value AS "window_start_year",
    min(m."month") FILTER (WHERE m."year" = latest_year.value) AS "window_start_month",
    round(
      (
        regr_slope(
          m."total_sales"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "total_sales_slope",
    round(
      (
        regr_slope(
          m."total_price"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "total_price_slope",
    round(
      (
        regr_slope(
          m."avg_price"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "avg_price_slope",
    round(
      (
        regr_slope(
          m."total_area"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "total_area_slope",
    round(
      (
        regr_slope(
          m."avg_area"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "avg_area_slope",
    round(
      (
        regr_slope(
          m."avg_price_m2"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "avg_price_m2_slope",
    round(
      (
        regr_slope(
          m."min_price"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "min_price_slope",
    round(
      (
        regr_slope(
          m."max_price"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "max_price_slope",
    round(
      (
        regr_slope(
          m."median_price"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "median_price_slope",
    round(
      (
        regr_slope(
          m."median_area"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "median_area_slope",
    round(
      (
        regr_slope(
          m."min_price_m2"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "min_price_m2_slope",
    round(
      (
        regr_slope(
          m."max_price_m2"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "max_price_m2_slope",
    round(
      (
        regr_slope(
          m."price_m2_p25"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "price_m2_p25_slope",
    round(
      (
        regr_slope(
          m."price_m2_p75"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "price_m2_p75_slope",
    round(
      (
        regr_slope(
          m."price_m2_iqr"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "price_m2_iqr_slope",
    round(
      (
        regr_slope(
          m."price_m2_stddev"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "price_m2_stddev_slope",
    round(
      (
        regr_slope(
          m."total_apartments"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "total_apartments_slope",
    round(
      (
        regr_slope(
          m."apartment_1_room"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "apartment_1_room_slope",
    round(
      (
        regr_slope(
          m."apartment_2_room"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "apartment_2_room_slope",
    round(
      (
        regr_slope(
          m."apartment_3_room"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "apartment_3_room_slope",
    round(
      (
        regr_slope(
          m."apartment_4_room"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "apartment_4_room_slope",
    round(
      (
        regr_slope(
          m."apartment_5_room"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "apartment_5_room_slope"
  FROM
    "public"."apartments_by_section_month" AS m
    CROSS JOIN latest_year
  GROUP BY
    m."insee_code",
    m."section",
    latest_year.value
  HAVING
    count(*) FILTER (WHERE m."year" = latest_year.value) > 0
);
--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."houses_by_section_month_slopes" AS (
  WITH latest_year AS (
    SELECT max("year") AS value
    FROM "public"."houses_by_section_month"
  )
  SELECT
    m."insee_code",
    m."section",
    (max(m."year") FILTER (WHERE m."year" = latest_year.value))::int AS "year",
    (max(m."month") FILTER (WHERE m."year" = latest_year.value))::int AS "month",
    count(*) FILTER (WHERE m."year" = latest_year.value)::int AS "window_months",
    latest_year.value AS "window_start_year",
    min(m."month") FILTER (WHERE m."year" = latest_year.value) AS "window_start_month",
    round(
      (
        regr_slope(
          m."total_sales"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "total_sales_slope",
    round(
      (
        regr_slope(
          m."total_price"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "total_price_slope",
    round(
      (
        regr_slope(
          m."avg_price"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "avg_price_slope",
    round(
      (
        regr_slope(
          m."total_area"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "total_area_slope",
    round(
      (
        regr_slope(
          m."avg_area"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "avg_area_slope",
    round(
      (
        regr_slope(
          m."avg_price_m2"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "avg_price_m2_slope",
    round(
      (
        regr_slope(
          m."min_price"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "min_price_slope",
    round(
      (
        regr_slope(
          m."max_price"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "max_price_slope",
    round(
      (
        regr_slope(
          m."median_price"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "median_price_slope",
    round(
      (
        regr_slope(
          m."median_area"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "median_area_slope",
    round(
      (
        regr_slope(
          m."min_price_m2"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "min_price_m2_slope",
    round(
      (
        regr_slope(
          m."max_price_m2"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "max_price_m2_slope",
    round(
      (
        regr_slope(
          m."price_m2_p25"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "price_m2_p25_slope",
    round(
      (
        regr_slope(
          m."price_m2_p75"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "price_m2_p75_slope",
    round(
      (
        regr_slope(
          m."price_m2_iqr"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "price_m2_iqr_slope",
    round(
      (
        regr_slope(
          m."price_m2_stddev"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "price_m2_stddev_slope",
    round(
      (
        regr_slope(
          m."total_houses"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "total_houses_slope",
    round(
      (
        regr_slope(
          m."house_1_room"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "house_1_room_slope",
    round(
      (
        regr_slope(
          m."house_2_room"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "house_2_room_slope",
    round(
      (
        regr_slope(
          m."house_3_room"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "house_3_room_slope",
    round(
      (
        regr_slope(
          m."house_4_room"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "house_4_room_slope",
    round(
      (
        regr_slope(
          m."house_5_room"::double precision,
          (m."year" * 12 + m."month")::double precision
        ) FILTER (WHERE m."year" = latest_year.value)
      )::numeric,
      6
    )::double precision AS "house_5_room_slope"
  FROM
    "public"."houses_by_section_month" AS m
    CROSS JOIN latest_year
  GROUP BY
    m."insee_code",
    m."section",
    latest_year.value
  HAVING
    count(*) FILTER (WHERE m."year" = latest_year.value) > 0
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_apts_insee_month_slopes" ON "public"."apartments_by_insee_code_month_slopes" ("insee_code");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_houses_insee_month_slopes" ON "public"."houses_by_insee_code_month_slopes" ("insee_code");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_apts_section_month_slopes" ON "public"."apartments_by_section_month_slopes" ("insee_code", "section");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_houses_section_month_slopes" ON "public"."houses_by_section_month_slopes" ("insee_code", "section");
