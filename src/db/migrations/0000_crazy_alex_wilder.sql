-- Add generated column
ALTER TABLE property_sales
ADD COLUMN primary_insee_code VARCHAR(10)
GENERATED ALWAYS AS (l_codinsee->>0) STORED;

-- Add index
CREATE INDEX idx_property_sales_primary_insee_code
ON property_sales(primary_insee_code);
