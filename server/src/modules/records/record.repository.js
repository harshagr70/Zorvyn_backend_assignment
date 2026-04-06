const Record = require("./record.model");

function buildQuery(filters = {}) {
  const query = { isDeleted: false };
  if (filters.type) query.type = filters.type;
  if (filters.category) query.category = filters.category;
  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) query.date.$gte = new Date(filters.startDate);
    if (filters.endDate) query.date.$lte = new Date(filters.endDate);
  }
  return query;
}

async function create(data) {
  return Record.create(data);
}

async function findAll(filters = {}, pagination = { page: 1, limit: 20 }, sort = "-date") {
  const query = buildQuery(filters);
  const page = Math.max(1, Number(pagination.page || 1));
  const limit = Math.max(1, Math.min(100, Number(pagination.limit || 20)));
  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    Record.find(query)
      .populate("createdBy", "name email role")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Record.countDocuments(query),
  ]);

  return { records, total, page, limit };
}

function findById(id) {
  return Record.findOne({ _id: id, isDeleted: false }).populate("createdBy", "name email role");
}

function update(id, data) {
  return Record.findOneAndUpdate({ _id: id, isDeleted: false }, data, {
    new: true,
    runValidators: true,
  }).populate("createdBy", "name email role");
}

function softDelete(id, deletedBy) {
  return Record.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true, deletedAt: new Date(), deletedBy },
    { new: true }
  );
}

function countAll(filters = {}) {
  return Record.countDocuments(buildQuery(filters));
}

function aggregate(pipeline) {
  return Record.aggregate(pipeline);
}

module.exports = { create, findAll, findById, update, softDelete, countAll, aggregate, buildQuery };
