const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'fleetflow',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function addMaxLoadCapacityColumn() {
  const client = await pool.connect();
  try {
    console.log('Connecting to database...');
    
    // Add the column if it doesn't exist
    await client.query(`
      ALTER TABLE vehicles 
      ADD COLUMN IF NOT EXISTS "maxLoadCapacity" DECIMAL(10, 2);
    `);
    
    console.log('✓ Column "maxLoadCapacity" added successfully!');
    
    // Verify the column was added
    const result = await client.query(`
      SELECT column_name, data_type, numeric_precision, numeric_scale
      FROM information_schema.columns 
      WHERE table_name = 'vehicles' AND column_name = 'maxLoadCapacity';
    `);
    
    if (result.rows.length > 0) {
      console.log('✓ Column verified in database:', result.rows[0]);
    }
    
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('✓ Column already exists - no action needed');
    } else {
      console.error('Error adding column:', error.message);
      throw error;
    }
  } finally {
    client.release();
    await pool.end();
  }
}

addMaxLoadCapacityColumn()
  .then(() => {
    console.log('\n✓ Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Migration failed:', error);
    process.exit(1);
  });
