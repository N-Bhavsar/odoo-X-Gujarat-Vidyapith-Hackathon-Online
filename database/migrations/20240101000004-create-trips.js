'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('trips', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      vehicle_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'vehicles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      driver_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'drivers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      origin: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      destination: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      scheduled_departure: {
        type: Sequelize.DATE,
        allowNull: false
      },
      scheduled_arrival: {
        type: Sequelize.DATE,
        allowNull: true
      },
      actual_departure: {
        type: Sequelize.DATE,
        allowNull: true
      },
      actual_arrival: {
        type: Sequelize.DATE,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'scheduled'
      },
      distance_km: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      cargo_description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      cargo_weight_kg: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex('trips', ['vehicle_id']);
    await queryInterface.addIndex('trips', ['driver_id']);
    await queryInterface.addIndex('trips', ['status']);
    await queryInterface.addIndex('trips', ['scheduled_departure']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('trips');
  }
};
