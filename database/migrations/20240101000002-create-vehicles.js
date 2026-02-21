'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vehicles', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      registration_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      make: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      model: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      vin: {
        type: Sequelize.STRING(17),
        allowNull: true,
        unique: true
      },
      capacity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      fuel_type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('active', 'maintenance', 'out_of_service'),
        allowNull: false,
        defaultValue: 'active'
      },
      current_mileage: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      last_service_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      next_service_due: {
        type: Sequelize.DATE,
        allowNull: true
      },
      insurance_expiry_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      registration_expiry_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('vehicles', ['registration_number']);
    await queryInterface.addIndex('vehicles', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('vehicles');
  }
};
