const asyncHandler = require("../../shared/utils/asyncHandler");
const userService = require("./user.service");

const list = asyncHandler(async (req, res) => {
  const filters = { role: req.query.role, status: req.query.status };
  const pagination = { page: req.query.page, limit: req.query.limit };
  const data = await userService.listUsers(filters, pagination);
  res.status(200).json({ success: true, data: data.users, meta: data.meta });
});

const getById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.status(200).json({ success: true, data: user });
});

const update = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  res.status(200).json({ success: true, data: user });
});

const deactivate = asyncHandler(async (req, res) => {
  const user = await userService.deactivateUser(req.params.id);
  res.status(200).json({ success: true, data: user });
});

module.exports = { list, getById, update, deactivate };
