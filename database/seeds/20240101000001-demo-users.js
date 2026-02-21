'use strict';
const path = require('path');
const bcrypt = require(path.resolve(__dirname, '../../backend/node_modules/bcryptjs'));

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await queryInterface.bulkInsert('users', [
      {
        email: 'admin@fleetflow.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        phone: '+1 (555) 123-4567',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'manager@fleetflow.com',
        password: hashedPassword,
        firstName: 'Fleet',
        lastName: 'Manager',
        role: 'fleet_manager',
        phone: '+1 (555) 234-5678',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'dispatcher@fleetflow.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Dispatcher',
        role: 'dispatcher',
        phone: '+1 (555) 345-6789',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'driver@fleetflow.com',
        password: hashedPassword,
        firstName: 'Mike',
        lastName: 'Driver',
        role: 'driver',
        phone: '+1 (555) 456-7890',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
