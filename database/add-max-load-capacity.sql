-- Add maxLoadCapacity column to vehicles table
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS "maxLoadCapacity" DECIMAL(10, 2);

COMMENT ON COLUMN vehicles."maxLoadCapacity" IS 'Maximum load capacity in kilograms';

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'vehicles' AND column_name = 'maxLoadCapacity';
