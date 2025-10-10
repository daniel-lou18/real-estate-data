ALTER TABLE property_sales
ADD COLUMN primary_parcel_id VARCHAR(15)
GENERATED ALWAYS AS (l_idpar->>0) STORED;

CREATE INDEX idx_property_sales_primary_parcel_id
ON property_sales(primary_parcel_id)
