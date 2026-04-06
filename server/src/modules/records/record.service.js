const recordRepository = require("./record.repository");
const { NotFoundError } = require("../../shared/errors");

async function createRecord(data, userId) {
  return recordRepository.create({ ...data, createdBy: userId, updatedBy: userId });
}

async function listRecords(filters, pagination, sort) {
  const result = await recordRepository.findAll(filters, pagination, sort);
  return {
    records: result.records,
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit),
    },
  };
}

async function getRecordById(id) {
  const record = await recordRepository.findById(id);
  if (!record) throw new NotFoundError("Record not found");
  return record;
}

async function updateRecord(id, data, userId) {
  const record = await recordRepository.update(id, { ...data, updatedBy: userId });
  if (!record) throw new NotFoundError("Record not found");
  return record;
}

async function deleteRecord(id, userId) {
  const record = await recordRepository.softDelete(id, userId);
  if (!record) throw new NotFoundError("Record not found");
  return record;
}

module.exports = { createRecord, listRecords, getRecordById, updateRecord, deleteRecord };
