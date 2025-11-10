DROP MATERIALIZED VIEW IF EXISTS "public"."apartments_by_section_month" CASCADE;
--> statement-breakpoint
DROP MATERIALIZED VIEW IF EXISTS "public"."houses_by_section_month" CASCADE;
--> statement-breakpoint
DROP MATERIALIZED VIEW IF EXISTS "public"."apartments_by_section_year" CASCADE;
--> statement-breakpoint
DROP MATERIALIZED VIEW IF EXISTS "public"."houses_by_section_year" CASCADE;
--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."apartments_by_section_month" AS (
  SELECT
    "property_sales"."primary_insee_code" AS "insee_code",
    concat(
      "property_sales"."primary_insee_code",
      '000',
      "property_sales"."primary_section"
    ) AS "section",
    "property_sales"."anneemut" AS "year",
    "property_sales"."moismut" AS "month",
    count(*)::int AS "total_sales",
    round(coalesce(sum("property_sales"."valeurfonc"), 0)) AS "total_price",
    round(coalesce(avg("property_sales"."valeurfonc"), 0)) AS "avg_price",
    round((coalesce(sum("property_sales"."sbatapt"), 0))::numeric, 1) AS "total_area",
    round((coalesce(avg("property_sales"."sbatapt"), 0))::numeric, 1) AS "avg_area",
    round(sum("property_sales"."valeurfonc") / nullif(sum("property_sales"."sbatapt"), 0)) AS "avg_price_m2",
    round(min("property_sales"."valeurfonc")) AS "min_price",
    round(max("property_sales"."valeurfonc")) AS "max_price",
    round(percentile_cont(0.5) WITHIN GROUP (ORDER BY "property_sales"."valeurfonc")) AS "median_price",
    round((percentile_cont(0.5) WITHIN GROUP (ORDER BY "property_sales"."sbatapt"))::numeric, 1) AS "median_area",
    round(min("property_sales"."valeurfonc" / nullif("property_sales"."sbatapt", 0))) AS "min_price_m2",
    round(max("property_sales"."valeurfonc" / nullif("property_sales"."sbatapt", 0))) AS "max_price_m2",
    round(percentile_cont(0.25) WITHIN GROUP (ORDER BY "property_sales"."valeurfonc" / nullif("property_sales"."sbatapt", 0))) AS "price_m2_p25",
    round(percentile_cont(0.75) WITHIN GROUP (ORDER BY "property_sales"."valeurfonc" / nullif("property_sales"."sbatapt", 0))) AS "price_m2_p75",
    round((percentile_cont(0.75) WITHIN GROUP (ORDER BY "property_sales"."valeurfonc" / nullif("property_sales"."sbatapt", 0))) - (percentile_cont(0.25) WITHIN GROUP (ORDER BY "property_sales"."valeurfonc" / nullif("property_sales"."sbatapt", 0)))) AS "price_m2_iqr",
    round(stddev_samp("property_sales"."valeurfonc" / nullif("property_sales"."sbatapt", 0))) AS "price_m2_stddev",
    coalesce(sum("property_sales"."nblocapt"), 0)::int AS "total_apartments",
    coalesce(sum("property_sales"."nbapt1pp"), 0)::int AS "apartment_1_room",
    coalesce(sum("property_sales"."nbapt2pp"), 0)::int AS "apartment_2_room",
    coalesce(sum("property_sales"."nbapt3pp"), 0)::int AS "apartment_3_room",
    coalesce(sum("property_sales"."nbapt4pp"), 0)::int AS "apartment_4_room",
    coalesce(sum("property_sales"."nbapt5pp"), 0)::int AS "apartment_5_room"
  FROM "property_sales"
  WHERE (
    "property_sales"."libtypbien" IN ('UN APPARTEMENT', 'DEUX APPARTEMENTS', 'APPARTEMENT INDETERMINE')
    AND "property_sales"."sbatapt" BETWEEN '10' AND '200'
    AND "property_sales"."valeurfonc" BETWEEN '1500' AND '5000000'
  )
  GROUP BY
    "property_sales"."primary_insee_code",
    concat(
      "property_sales"."primary_insee_code",
      '000',
      "property_sales"."primary_section"
    ),
    "property_sales"."anneemut",
    "property_sales"."moismut"
);
--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."houses_by_section_month" AS (
  SELECT
    "property_sales"."primary_insee_code" AS "insee_code",
    concat(
      "property_sales"."primary_insee_code",
      '000',
      "property_sales"."primary_section"
    ) AS "section",
    "property_sales"."anneemut" AS "year",
    "property_sales"."moismut" AS "month",
    count(*)::int AS "total_sales",
    round(coalesce(sum("property_sales"."valeurfonc"), 0)) AS "total_price",
    round(coalesce(avg("property_sales"."valeurfonc"), 0)) AS "avg_price",
    round((coalesce(sum("property_sales"."sbatmai"), 0))::numeric, 1) AS "total_area",
    round((coalesce(avg("property_sales"."sbatmai"), 0))::numeric, 1) AS "avg_area",
    round(sum("property_sales"."valeurfonc") / nullif(sum("property_sales"."sbatmai"), 0)) AS "avg_price_m2",
    round(min("property_sales"."valeurfonc")) AS "min_price",
    round(max("property_sales"."valeurfonc")) AS "max_price",
    round(percentile_cont(0.5) WITHIN GROUP (ORDER BY "property_sales"."valeurfonc")) AS "median_price",
    round((percentile_cont(0.5) WITHIN GROUP (ORDER BY "property_sales"."sbatmai"))::numeric, 1) AS "median_area",
    round(min("property_sales"."valeurfonc" / nullif("property_sales"."sbatmai", 0))) AS "min_price_m2",
    round(max("property_sales"."valeurfonc" / nullif("property_sales"."sbatmai", 0))) AS "max_price_m2",
    round(percentile_cont(0.25) WITHIN GROUP (ORDER BY "property_sales"."valeurfonc" / nullif("property_sales"."sbatmai", 0))) AS "price_m2_p25",
    round(percentile_cont(0.75) WITHIN GROUP (ORDER BY "property_sales"."valeurfonc" / nullif("property_sales"."sbatmai", 0))) AS "price_m2_p75",
    round((percentile_cont(0.75) WITHIN GROUP (ORDER BY "property_sales"."valeurfonc" / nullif("property_sales"."sbatmai", 0))) - (percentile_cont(0.25) WITHIN GROUP (ORDER BY "property_sales"."valeurfonc" / nullif("property_sales"."sbatmai", 0)))) AS "price_m2_iqr",
    round(stddev_samp("property_sales"."valeurfonc" / nullif("property_sales"."sbatmai", 0))) AS "price_m2_stddev",
    coalesce(sum("property_sales"."nblocmai"), 0)::int AS "total_houses",
    coalesce(sum("property_sales"."nbmai1pp"), 0)::int AS "house_1_room",
    coalesce(sum("property_sales"."nbmai2pp"), 0)::int AS "house_2_room",
    coalesce(sum("property_sales"."nbmai3pp"), 0)::int AS "house_3_room",
    coalesce(sum("property_sales"."nbmai4pp"), 0)::int AS "house_4_room",
    coalesce(sum("property_sales"."nbmai5pp"), 0)::int AS "house_5_room"
  FROM "property_sales"
  WHERE (
    "property_sales"."libtypbien" IN ('UNE MAISON', 'DES MAISONS', 'MAISON - INDETERMINEE')
    AND "property_sales"."sbatmai" BETWEEN '20' AND '300'
    AND "property_sales"."valeurfonc" BETWEEN '1500' AND '15000000'
  )
  GROUP BY
    "property_sales"."primary_insee_code",
    concat(
      "property_sales"."primary_insee_code",
      '000',
      "property_sales"."primary_section"
    ),
    "property_sales"."anneemut",
    "property_sales"."moismut"
);
--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."apartments_by_section_year" AS (
  SELECT
    "property_sales"."primary_insee_code" AS "insee_code",
    concat(
      "property_sales"."primary_insee_code",
      '000',
      "property_sales"."primary_section"
    ) AS "section",
    "property_sales"."anneemut" AS "year",
    count(*)::int AS "total_sales",
    round(coalesce(sum("property_sales"."valeurfonc"), 0)) AS "total_price",
    round(coalesce(avg("property_sales"."valeurfonc"), 0)) AS "avg_price",
    round((coalesce(sum("property_sales"."sbatapt"), 0))::numeric, 1) AS "total_area",
    round((coalesce(avg("property_sales"."sbatapt"), 0))::numeric, 1) AS "avg_area",
    round(sum("property_sales"."valeurfonc") / nullif(sum("property_sales"."sbatapt"), 0)) AS "avg_price_m2",
    round(min("property_sales"."valeurfonc")) AS "min_price",
    round(max("property_sales"."valeurfonc")) AS "max_price",
    round(percentile_cont(0.5) WITHIN GROUP (ORDER BY "property_sales"."valeurfonc")) AS "median_price",
    round((percentile_cont(0.5) WITHIN GROUP (ORDER BY "property_sales"."sbatapt"))::numeric, 1) AS "median_area",
    round(min("property_sales"."valeurfonc" / nullif("property_sales"."sbatapt", 0))) AS "min_price_m2",
    round(max("property_sales"."valeurfonc" / nullif("property_sales"."sbatapt", 0))) AS "max_price_m2",
    round(percentile_cont(0.25) WITHIN GROUP (ORDER BY "property_sales"."valeurfonc" / nullif("property_sales"."sbatapt", 0))) AS "price_m2_p25",
    round(percentile_cont(0.75) WITHIN GROUP (ORDER BY "property_sales"."valeurfonc" / nullif("property_sales"."sbatapt", 0))) AS "price_m2_p75",
    round((percentile_cont(0.75) WITHIN GROUP (ORDER BY "property_sales"."valeurfonc" / nullif("property_sales"."sbatapt", 0))) - (percentile_cont(0.25) WITHIN GROUP (ORDER BY "property_sales"."valeurfonc" / nullif("property_sales"."sbatapt", 0)))) AS "price_m2_iqr",
    round(stddev_samp("property_sales"."valeurfonc" / nullif("property_sales"."sbatapt", 0))) AS "price_m2_stddev",
    coalesce(sum("property_sales"."nblocapt"), 0)::int AS "total_apartments",
    coalesce(sum("property_sales"."nbapt1pp"), 0)::int AS "apartment_1_room",
    coalesce(sum("property_sales"."nbapt2pp"), 0)::int AS "apartment_2_room",
    coalesce(sum("property_sales"."nbapt3pp"), 0)::int AS "apartment_3_room",
    coalesce(sum("property_sales"."nbapt4pp"), 0)::int AS "apartment_4_room",
    coalesce(sum("property_sales"."nbapt5pp"), 0)::int AS "apartment_5_room"
  FROM "property_sales"
  WHERE (
    "property_sales"."libtypbien" IN ('UN APPARTEMENT', 'DEUX APPARTEMENTS', 'APPARTEMENT INDETERMINE')
    AND "property_sales"."sbatapt" BETWEEN '10' AND '200'
    AND "property_sales"."valeurfonc" BETWEEN '1500' AND '5000000'
  )
  GROUP BY
    "property_sales"."primary_insee_code",
    concat(
      "property_sales"."primary_insee_code",
      '000',
      "property_sales"."primary_section"
    ),
    "property_sales"."anneemut"
);
--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."houses_by_section_year" AS (
  SELECT
    "property_sales"."primary_insee_code" AS "insee_code",
    concat(
      "property_sales"."primary_insee_code",
      '000',
      "property_sales"."primary_section"
    ) AS "section",
    "property_sales"."anneemut" AS "year",
    count(*)::int AS "total_sales",
    round(coalesce(sum("property_sales"."valeurfonc"), 0)) AS "total_price",
    round(coalesce(avg("property_sales"."valeurfonc"), 0)) AS "avg_price",
    round((coalesce(sum("property_sales"."sbatmai"), 0))::numeric, 1) AS "total_area",
    round((coalesce(avg("property_sales"."sbatmai"), 0))::numeric, 1) AS "avg_area",
    round(sum("property_sales"."valeurfonc") / nullif(sum("property_sales"."sbatmai"), 0)) AS "avg_price_m2",
    round(min("property_sales"."valeurfonc")) AS "min_price",
    round(max("property_sales"."valeurfonc")) AS "max_price",
    round(percentile_cont(0.5) WITHIN GROUP (ORDER BY "property_sales"."valeurfonc")) AS "median_price",
    round((percentile_cont(0.5) WITHIN GROUP (ORDER BY "property_sales"."sbatmai"))::numeric, 1) AS "median_area",
    round(min("property_sales"."valeurfonc" / nullif("property_sales"."sbatmai", 0))) AS "min_price_m2",
    round(max("property_sales"."valeurfonc" / nullif("property_sales"."sbatmai", 0))) AS "max_price_m2",
    round(percentile_cont(0.25) WITHIN GROUP (ORDER BY "property_sales"."valeurfonc" / nullif("property_sales"."sbatmai", 0))) AS "price_m2_p25",
    round(percentile_cont(0.75) WITHIN GROUP (ORDER BY "property_sales"."valeurfonc" / nullif("property_sales"."sbatmai", 0))) AS "price_m2_p75",
    round((percentile_cont(0.75) WITHIN GROUP (ORDER BY "property_sales"."valeurfonc" / nullif("property_sales"."sbatmai", 0))) - (percentile_cont(0.25) WITHIN GROUP (ORDER BY "property_sales"."valeurfonc" / nullif("property_sales"."sbatmai", 0)))) AS "price_m2_iqr",
    round(stddev_samp("property_sales"."valeurfonc" / nullif("property_sales"."sbatmai", 0))) AS "price_m2_stddev",
    coalesce(sum("property_sales"."nblocmai"), 0)::int AS "total_houses",
    coalesce(sum("property_sales"."nbmai1pp"), 0)::int AS "house_1_room",
    coalesce(sum("property_sales"."nbmai2pp"), 0)::int AS "house_2_room",
    coalesce(sum("property_sales"."nbmai3pp"), 0)::int AS "house_3_room",
    coalesce(sum("property_sales"."nbmai4pp"), 0)::int AS "house_4_room",
    coalesce(sum("property_sales"."nbmai5pp"), 0)::int AS "house_5_room"
  FROM "property_sales"
  WHERE (
    "property_sales"."libtypbien" IN ('UNE MAISON', 'DES MAISONS', 'MAISON - INDETERMINEE')
    AND "property_sales"."sbatmai" BETWEEN '20' AND '300'
    AND "property_sales"."valeurfonc" BETWEEN '1500' AND '15000000'
  )
  GROUP BY
    "property_sales"."primary_insee_code",
    concat(
      "property_sales"."primary_insee_code",
      '000',
      "property_sales"."primary_section"
    ),
    "property_sales"."anneemut"
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_apts_section_month" ON "public"."apartments_by_section_month" ("section", "year", "month");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_houses_section_month" ON "public"."houses_by_section_month" ("section", "year", "month");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_apts_section_year" ON "public"."apartments_by_section_year" ("section", "year");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_houses_section_year" ON "public"."houses_by_section_year" ("section", "year");
