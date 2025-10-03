ALTER TABLE property_sales
ADD COLUMN primary_section VARCHAR(5)
GENERATED ALWAYS AS (l_section->>0) STORED;

CREATE INDEX idx_property_sales_primary_section
ON property_sales(primary_section);
