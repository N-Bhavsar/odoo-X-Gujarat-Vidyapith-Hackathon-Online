'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop the old table and recreate with correct schema
    await queryInterface.dropTable('vehicles');
    
    await queryInterface.createTable('vehicles', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      vehicleNumber: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        field: 'vehicleNumber'
      },
      registrationNumber: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        field: 'registrationNumber'
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
      type: {
        type: Sequelize.ENUM('sedan', 'suv', 'van', 'truck', 'bus', 'motorcycle'),
        allowNull: false,
        defaultValue: 'sedan'
      },
      fuelType: {
        type: Sequelize.ENUM('petrol', 'diesel', 'electric', 'hybrid', 'cng'),
        allowNull: false,
        defaultValue: 'petrol',
        field: 'fuelType'
      },
      status: {
        type: Sequelize.ENUM('active', 'maintenance', 'inactive', 'retired'),
        allowNull: false,
        defaultValue: 'active'
      },
      currentMileage: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'currentMileage'
      },
      seatingCapacity: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'seatingCapacity'
      },
      color: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      purchasePrice: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
        field: 'purchasePrice'
      },
      currentValue: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
        field: 'currentValue'
      },
      lastServiceDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'lastServiceDate'
      },
      nextServiceDue: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'nextServiceDue'
      },
      insuranceNumber: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: 'insuranceNumber'
      },
      insuranceExpiryDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'insuranceExpiryDate'
      },
      registrationExpiryDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'registrationExpiryDate'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      imageUrl: {
        type: Sequelize.STRING(500),
        allowNull: true,
        field: 'imageUrl'
      },
      assignedDriverId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'assignedDriverId'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'createdAt'
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'updatedAt'
      }
    });

    // Add indexes
    await queryInterface.addIndex('vehicles', ['vehicleNumber']);
    await queryInterface.addIndex('vehicles', ['registrationNumber']);
    await queryInterface.addIndex('vehicles', ['status']);
    await queryInterface.addIndex('vehicles', ['type']);
  },

  async down(queryInterface, Sequelize) {
    // Revert to the old schema
    await queryInterface.dropTable('vehicles');
    
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
  }
};