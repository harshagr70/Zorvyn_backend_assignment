const asyncHandler = require("../../shared/utils/asyncHandler");
const recordService = require("./record.service");

const create = asyncHandler(async (req, res) => {
  const record = await recordService.createRecord(req.body, req.user._id);
  res.status(201).json({ success: true, data: record });
});

const list = asyncHandler(async (req, res) => {
  const filters = {
    type: req.query.type,
    category: req.query.category,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
  };
  const pagination = { page: req.query.page, limit: req.query.limit };
  const result = await recordService.listRecords(filters, pagination, req.query.sort || "-date");
  res.status(200).json({ success: true, data: result.records, meta: result.meta });
});

const getById = asyncHandler(async (req, res) => {
  const record = await recordService.getRecordById(req.params.id);
  res.status(200).json({ success: true, data: record });
});

const update = asyncHandler(async (req, res) => {
  const record = await recordService.updateRecord(req.params.id, req.body, req.user._id);
  res.status(200).json({ success: true, data: record });
});

const remove = asyncHandler(async (req, res) => {
  const record = await recordService.deleteRecord(req.params.id, req.user._id);
  res.status(200).json({ success: true, data: record });
});

module.exports = { create, list, getById, update, remove };
