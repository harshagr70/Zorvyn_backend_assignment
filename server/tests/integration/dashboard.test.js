const request = require("supertest");
const app = require("../../src/app");
const { createUser } = require("../fixtures/users");
const { createRecord } = require("../fixtures/records");

describe("Dashboard API", () => {
  it("analyst can access summary", async () => {
    const { user, token } = await createUser("analyst");
    await createRecord({ createdBy: user._id, updatedBy: user._id, type: "income", amount: 2000 });
    await createRecord({ createdBy: user._id, updatedBy: user._id, type: "expense", amount: 500, category: "food" });

    const response = await request(app)
      .get("/api/v1/dashboard/summary")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data.totalIncome).toBeGreaterThan(0);
  });

  it("viewer cannot access summary", async () => {
    const { token } = await createUser("viewer");
    const response = await request(app)
      .get("/api/v1/dashboard/summary")
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(403);
  });
});
