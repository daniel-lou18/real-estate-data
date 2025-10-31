-- Custom SQL migration file, put your code below! --
-- Fix geometry column types
ALTER TABLE communes_geom ALTER COLUMN geom TYPE geometry(MultiPolygon, 4326);
ALTER TABLE sections_geom ALTER COLUMN geom TYPE geometry(MultiPolygon, 4326);
-- Map communes from staging to final table
INSERT INTO communes_geom (insee_code, name, geom)
SELECT
  id as insee_code,
  nom as name,
  geom
FROM communes_geom_staging
ON CONFLICT (insee_code) DO UPDATE SET
  name = EXCLUDED.name,
  geom = EXCLUDED.geom;
-- Map sections from staging to final table
INSERT INTO sections_geom (section, insee_code, prefix, code, geom)
SELECT
  id as section,
  commune as insee_code,
  prefixe as prefix,
  code,
  geom
FROM sections_geom_staging
ON CONFLICT (section) DO UPDATE SET
  insee_code = EXCLUDED.insee_code,
  prefix = EXCLUDED.prefix,
  code = EXCLUDED.code,
  geom = EXCLUDED.geom;
