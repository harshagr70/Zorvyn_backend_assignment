const Record = require("../../src/modules/records/record.model");
const { RECORD_TYPES } = require("../../src/shared/constants");

async function createRecord(overrides = {}) {
  return Record.create({
    amount: 1200,
    type: RECORD_TYPES.INCOME,
    category: "salary",
    date: new Date(),
    description: "Fixture record",
    createdBy: overrides.createdBy,
    updatedBy: overrides.createdBy,
    ...overrides,
  });
}

module.exports = { createRecord };
