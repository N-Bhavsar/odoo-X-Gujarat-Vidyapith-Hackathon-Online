'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('drivers', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      license_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      license_expiry_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      license_class: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      emergency_contact_name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      emergency_contact_phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'suspended'),
        allowNull: false,
        defaultValue: 'active'
      },
      hire_date: {
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

    await queryInterface.addIndex('drivers', ['user_id']);
    await queryInterface.addIndex('drivers', ['license_number']);
    await queryInterface.addIndex('drivers', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('drivers');
  }
};
