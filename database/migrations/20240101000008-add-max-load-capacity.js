'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('vehicles', 'maxLoadCapacity', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Maximum load capacity in kilograms',
      after: 'seatingCapacity'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('vehicles', 'maxLoadCapacity');
  }
};
