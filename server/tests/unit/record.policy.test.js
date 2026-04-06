const RecordPolicy = require("../../src/modules/records/record.policy");

describe("RecordPolicy", () => {
  const admin = { _id: "a1", role: "admin" };
  const analyst = { _id: "b1", role: "analyst" };
  const viewer = { _id: "c1", role: "viewer" };
  const ownRecord = { createdBy: "b1" };
  const otherRecord = { createdBy: "x1" };

  it("allows create for admin and analyst only", () => {
    expect(RecordPolicy.create(admin)).toBe(true);
    expect(RecordPolicy.create(analyst)).toBe(true);
    expect(RecordPolicy.create(viewer)).toBe(false);
  });

  it("allows analyst update only on own record", () => {
    expect(RecordPolicy.update(analyst, ownRecord)).toBe(true);
    expect(RecordPolicy.update(analyst, otherRecord)).toBe(false);
  });

  it("treats populated createdBy as owner match", () => {
    const populatedOwn = { createdBy: { _id: "b1", name: "Analyst" } };
    expect(RecordPolicy.update(analyst, populatedOwn)).toBe(true);
  });
});
