const recordRepository = require("./record.repository");
const { NotFoundError } = require("../../shared/errors");

async function loadRecord(req, res, next) {
  try {
    const record = await recordRepository.findById(req.params.id);
    if (!record) {
      return next(new NotFoundError("Record not found"));
    }
    req.resource = record;
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = { loadRecord };
