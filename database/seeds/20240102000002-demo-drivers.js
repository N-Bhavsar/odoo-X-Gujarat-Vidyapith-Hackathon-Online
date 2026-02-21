'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get some user IDs for driver assignments - only use first 4 users
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM users LIMIT 4;',
      { type: Sequelize.QueryTypes.SELECT }
    )

    if (users.length < 4) {
      console.log('⚠️  Need at least 4 users. Please seed users first.')
      return
    }

    await queryInterface.bulkInsert('drivers', [
      {
        user_id: users[0].id,
        first_name: 'Michael',
        last_name: 'Anderson',
        email: 'michael.anderson@fleetflow.com',
        phone: '+1-555-0101',
        license_number: 'DL-2024-001',
        license_class: 'C',
        license_expiry_date: new Date('2026-12-31'),
        license_issue_date: new Date('2021-01-15'),
        address: '123 Oak Street',
        city: 'New York',
        state: 'NY',
        zip_code: '10001',
        emergency_contact_name: 'Sarah Anderson',
        emergency_contact_phone: '+1-555-0102',
        status: 'active',
        safety_score: 95,
        total_trips: 145,
        completed_trips: 140,
        cancelled_trips: 5,
        hire_date: new Date('2022-03-15'),
        date_of_birth: new Date('1985-06-20'),
        medical_certificate_expiry: new Date('2025-12-31'),
        background_check_date: new Date('2024-01-10'),
        notes: 'Excellent driver with clean record. Specializes in long-haul routes.',
        created_at: new Date('2024-01-01T10:00:00'),
        updated_at: new Date('2024-01-01T10:00:00')
      },
      {
        user_id: users[1].id,
        first_name: 'Jennifer',
        last_name: 'Martinez',
        email: 'jennifer.martinez@fleetflow.com',
        phone: '+1-555-0201',
        license_number: 'DL-2024-002',
        license_class: 'CE',
        license_expiry_date: new Date('2027-06-30'),
        license_issue_date: new Date('2020-05-10'),
        address: '456 Pine Avenue',
        city: 'Los Angeles',
        state: 'CA',
        zip_code: '90001',
        emergency_contact_name: 'Carlos Martinez',
        emergency_contact_phone: '+1-555-0202',
        status: 'active',
        safety_score: 98,
        total_trips: 220,
        completed_trips: 218,
        cancelled_trips: 2,
        hire_date: new Date('2021-08-20'),
        date_of_birth: new Date('1988-11-15'),
        medical_certificate_expiry: new Date('2026-06-30'),
        background_check_date: new Date('2024-01-05'),
        notes: 'Top-rated driver. Expert in handling heavy cargo and oversized loads.',
        created_at: new Date('2024-01-01T10:00:00'),
        updated_at: new Date('2024-01-01T10:00:00')
      },
      {
        user_id: users[2].id,
        first_name: 'David',
        last_name: 'Johnson',
        email: 'david.johnson@fleetflow.com',
        phone: '+1-555-0301',
        license_number: 'DL-2024-003',
        license_class: 'B',
        license_expiry_date: new Date('2025-09-30'),
        license_issue_date: new Date('2019-09-01'),
        address: '789 Maple Drive',
        city: 'Chicago',
        state: 'IL',
        zip_code: '60601',
        emergency_contact_name: 'Emily Johnson',
        emergency_contact_phone: '+1-555-0302',
        status: 'active',
        safety_score: 92,
        total_trips: 178,
        completed_trips: 172,
        cancelled_trips: 6,
        hire_date: new Date('2022-06-10'),
        date_of_birth: new Date('1990-03-25'),
        medical_certificate_expiry: new Date('2025-09-30'),
        background_check_date: new Date('2023-12-20'),
        notes: 'Reliable driver for local deliveries. Good customer relations.',
        created_at: new Date('2024-01-01T10:00:00'),
        updated_at: new Date('2024-01-01T10:00:00')
      },
      {
        user_id: users[3].id,
        first_name: 'Robert',
        last_name: 'Thompson',
        email: 'robert.thompson@fleetflow.com',
        phone: '+1-555-0401',
        license_number: 'DL-2024-004',
        license_class: 'C',
        license_expiry_date: new Date('2026-03-31'),
        license_issue_date: new Date('2021-03-15'),
        address: '321 Elm Street',
        city: 'Houston',
        state: 'TX',
        zip_code: '77001',
        emergency_contact_name: 'Linda Thompson',
        emergency_contact_phone: '+1-555-0402',
        status: 'active',
        safety_score: 94,
        total_trips: 189,
        completed_trips: 185,
        cancelled_trips: 4,
        hire_date: new Date('2022-01-05'),
        date_of_birth: new Date('1982-09-10'),
        medical_certificate_expiry: new Date('2026-03-31'),
        background_check_date: new Date('2024-01-08'),
        notes: 'Experienced driver with excellent knowledge of southern routes.',
        created_at: new Date('2024-01-01T10:00:00'),
        updated_at: new Date('2024-01-01T10:00:00')
      }
    ])

    console.log('✅ Demo drivers seeded successfully')
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('drivers', null, {})
  }
}
