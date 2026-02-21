'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, get some vehicle and driver IDs to reference
    const vehicles = await queryInterface.sequelize.query(
      'SELECT id FROM vehicles LIMIT 4;',
      { type: Sequelize.QueryTypes.SELECT }
    )
    
    const drivers = await queryInterface.sequelize.query(
      'SELECT id FROM drivers LIMIT 4;',
      { type: Sequelize.QueryTypes.SELECT }
    )

    if (vehicles.length === 0 || drivers.length === 0) {
      console.log('Please seed vehicles and drivers first')
      return
    }

    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextWeek = new Date(now)
    nextWeek.setDate(nextWeek.getDate() + 7)

    await queryInterface.bulkInsert('trips', [
      {
        vehicle_id: vehicles[0].id,
        driver_id: drivers[0].id,
        origin: 'New York, NY - 123 Main Street',
        destination: 'Boston, MA - 456 Harbor Ave',
        scheduled_departure: new Date('2024-01-15T08:00:00'),
        scheduled_arrival: new Date('2024-01-15T12:00:00'),
        actual_departure: new Date('2024-01-15T08:15:00'),
        actual_arrival: new Date('2024-01-15T12:30:00'),
        status: 'completed',
        distance_km: 350,
        cargo_description: 'Electronics - Laptops and Computer Parts',
        cargo_weight_kg: 500,
        notes: 'Delivered successfully. Customer signed receipt.',
        created_at: new Date('2024-01-10T10:00:00'),
        updated_at: new Date('2024-01-15T12:30:00')
      },
      {
        vehicle_id: vehicles[1].id,
        driver_id: drivers[1].id,
        origin: 'Los Angeles, CA - 789 Sunset Blvd',
        destination: 'San Francisco, CA - 321 Bay Street',
        scheduled_departure: new Date('2024-01-16T06:00:00'),
        scheduled_arrival: new Date('2024-01-16T12:00:00'),
        actual_departure: new Date('2024-01-16T06:10:00'),
        actual_arrival: new Date('2024-01-16T12:45:00'),
        status: 'completed',
        distance_km: 615,
        cargo_description: 'Furniture - Office Desks and Chairs',
        cargo_weight_kg: 1200,
        notes: 'Minor delay due to traffic. All items delivered intact.',
        created_at: new Date('2024-01-12T14:00:00'),
        updated_at: new Date('2024-01-16T12:45:00')
      },
      {
        vehicle_id: vehicles[2].id,
        driver_id: drivers[2].id,
        origin: 'Chicago, IL - 555 Michigan Ave',
        destination: 'Detroit, MI - 888 Woodward Ave',
        scheduled_departure: now,
        scheduled_arrival: new Date(now.getTime() + 4 * 60 * 60 * 1000), // +4 hours
        actual_departure: now,
        actual_arrival: null,
        status: 'in_progress',
        distance_km: 450,
        cargo_description: 'Pharmaceuticals - Medical Supplies',
        cargo_weight_kg: 300,
        notes: 'Temperature controlled shipment. Currently in transit.',
        created_at: new Date('2024-01-14T09:00:00'),
        updated_at: now
      },
      {
        vehicle_id: vehicles[3].id,
        driver_id: drivers[3].id,
        origin: 'Houston, TX - 777 Texas Ave',
        destination: 'Dallas, TX - 999 Commerce St',
        scheduled_departure: tomorrow,
        scheduled_arrival: new Date(tomorrow.getTime() + 5 * 60 * 60 * 1000), // +5 hours
        actual_departure: null,
        actual_arrival: null,
        status: 'scheduled',
        distance_km: 385,
        cargo_description: 'Textiles - Clothing and Fabric',
        cargo_weight_kg: 800,
        notes: 'Pickup scheduled for tomorrow morning.',
        created_at: new Date('2024-01-16T15:00:00'),
        updated_at: new Date('2024-01-16T15:00:00')
      },
      {
        vehicle_id: vehicles[3].id,
        driver_id: drivers[3].id,
        origin: 'Miami, FL - 444 Ocean Drive',
        destination: 'Orlando, FL - 222 International Dr',
        scheduled_departure: nextWeek,
        scheduled_arrival: new Date(nextWeek.getTime() + 4 * 60 * 60 * 1000),
        actual_departure: null,
        actual_arrival: null,
        status: 'scheduled',
        distance_km: 380,
        cargo_description: 'Food Products - Fresh Produce',
        cargo_weight_kg: 1500,
        notes: 'Refrigerated truck required. Special handling instructions provided.',
        created_at: new Date('2024-01-17T08:00:00'),
        updated_at: new Date('2024-01-17T08:00:00')
      },
      {
        vehicle_id: vehicles[0].id,
        driver_id: drivers[1].id,
        origin: 'Seattle, WA - 111 Pike Street',
        destination: 'Portland, OR - 333 Broadway',
        scheduled_departure: new Date('2024-01-18T10:00:00'),
        scheduled_arrival: new Date('2024-01-18T13:30:00'),
        actual_departure: null,
        actual_arrival: null,
        status: 'scheduled',
        distance_km: 280,
        cargo_description: 'Books and Stationery',
        cargo_weight_kg: 600,
        notes: 'Multiple delivery points. Route map attached.',
        created_at: new Date('2024-01-15T11:00:00'),
        updated_at: new Date('2024-01-15T11:00:00')
      },
      {
        vehicle_id: vehicles[1].id,
        driver_id: drivers[2].id,
        origin: 'Phoenix, AZ - 666 Central Ave',
        destination: 'Las Vegas, NV - 777 Strip Blvd',
        scheduled_departure: new Date('2024-01-12T14:00:00'),
        scheduled_arrival: new Date('2024-01-12T19:00:00'),
        actual_departure: null,
        actual_arrival: null,
        status: 'cancelled',
        distance_km: 475,
        cargo_description: 'Auto Parts',
        cargo_weight_kg: 900,
        notes: 'Trip cancelled due to vehicle maintenance issue.',
        created_at: new Date('2024-01-11T16:00:00'),
        updated_at: new Date('2024-01-12T10:00:00')
      },
      {
        vehicle_id: vehicles[2].id,
        driver_id: drivers[3].id,
        origin: 'Denver, CO - 888 Colfax Ave',
        destination: 'Salt Lake City, UT - 555 Temple Square',
        scheduled_departure: new Date('2024-01-20T07:00:00'),
        scheduled_arrival: new Date('2024-01-20T15:00:00'),
        actual_departure: null,
        actual_arrival: null,
        status: 'scheduled',
        distance_km: 840,
        cargo_description: 'Industrial Equipment',
        cargo_weight_kg: 2000,
        notes: 'Heavy load. Escort vehicle required.',
        created_at: new Date('2024-01-16T13:00:00'),
        updated_at: new Date('2024-01-16T13:00:00')
      },
      {
        vehicle_id: vehicles[3].id,
        driver_id: drivers[4].id,
        origin: 'Atlanta, GA - 999 Peachtree St',
        destination: 'Charlotte, NC - 444 Trade St',
        scheduled_departure: new Date('2024-01-13T09:00:00'),
        scheduled_arrival: new Date('2024-01-13T13:30:00'),
        actual_departure: new Date('2024-01-13T09:05:00'),
        actual_arrival: new Date('2024-01-13T13:20:00'),
        status: 'completed',
        distance_km: 395,
        cargo_description: 'Consumer Electronics',
        cargo_weight_kg: 700,
        notes: 'Early delivery. Customer very satisfied.',
        created_at: new Date('2024-01-10T12:00:00'),
        updated_at: new Date('2024-01-13T13:20:00')
      },
      {
        vehicle_id: vehicles[3].id,
        driver_id: drivers[3].id,
        origin: 'Philadelphia, PA - 123 Liberty Bell Way',
        destination: 'Washington, DC - 456 Constitution Ave',
        scheduled_departure: new Date('2024-01-19T11:00:00'),
        scheduled_arrival: new Date('2024-01-19T14:00:00'),
        actual_departure: null,
        actual_arrival: null,
        status: 'scheduled',
        distance_km: 225,
        cargo_description: 'Legal Documents and Files',
        cargo_weight_kg: 150,
        notes: 'High priority delivery. Signature required.',
        created_at: new Date('2024-01-17T10:00:00'),
        updated_at: new Date('2024-01-17T10:00:00')
      },
      {
        vehicle_id: vehicles[0].id,
        driver_id: drivers[2].id,
        origin: 'Minneapolis, MN - 777 Nicollet Mall',
        destination: 'Milwaukee, WI - 888 Wisconsin Ave',
        scheduled_departure: yesterday,
        scheduled_arrival: new Date(yesterday.getTime() + 6 * 60 * 60 * 1000),
        actual_departure: yesterday,
        actual_arrival: null,
        status: 'cancelled',
        distance_km: 545,
        cargo_description: 'Machinery Parts',
        cargo_weight_kg: 1100,
        notes: 'Cancelled mid-route due to weather conditions.',
        created_at: new Date('2024-01-14T08:00:00'),
        updated_at: yesterday
      }
    ])

    console.log('✅ Demo trips seeded successfully')
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('trips', null, {})
  }
}
