'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('gps_locations', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      trip_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'trips',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      vehicle_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'vehicles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: false,
        validate: {
          min: -90,
          max: 90
        }
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: false,
        validate: {
          min: -180,
          max: 180
        }
      },
      altitude: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Altitude in meters'
      },
      accuracy: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        comment: 'GPS accuracy in meters'
      },
      speed: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: true,
        comment: 'Speed in km/h'
      },
      heading: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: true,
        comment: 'Direction in degrees (0-360)'
      },
      source: {
        type: Sequelize.ENUM('mobile_app', 'gps_device', 'manual'),
        defaultValue: 'mobile_app',
        allowNull: false
      },
      is_geofence_complete: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Whether vehicle completed geofence zone'
      },
      geofence_id: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Reference to geofence zone'
      },
      idle_start_time: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'When idle tracking started'
      },
      is_idle: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Whether vehicle is currently idle'
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: 'When the location was recorded'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create indexes for better query performance
    await queryInterface.addIndex('gps_locations', ['vehicle_id', 'timestamp']);
    await queryInterface.addIndex('gps_locations', ['trip_id']);
    await queryInterface.addIndex('gps_locations', ['timestamp']);
    await queryInterface.addIndex('gps_locations', ['latitude', 'longitude']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('gps_locations');
  }
};
