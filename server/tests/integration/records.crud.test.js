const request = require("supertest");
const app = require("../../src/app");
const { createUser } = require("../fixtures/users");
const { createRecord } = require("../fixtures/records");

describe("Records CRUD API", () => {
  it("creates record with analyst role", async () => {
    const { user, token } = await createUser("analyst");
    const response = await request(app)
      .post("/api/v1/records")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 500,
        type: "income",
        category: "salary",
        date: new Date().toISOString(),
        description: "salary",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.data.createdBy).toBe(user._id.toString());
  });

  it("rejects invalid record payload", async () => {
    const { token } = await createUser("analyst");
    const response = await request(app)
      .post("/api/v1/records")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: -100,
        type: "income",
        category: "salary",
        date: new Date().toISOString(),
      });

    expect(response.statusCode).toBe(400);
  });

  it("lists records", async () => {
    const { user, token } = await createUser("viewer");
    await createRecord({ createdBy: user._id, updatedBy: user._id, type: "expense", category: "food" });
    const response = await request(app)
      .get("/api/v1/records")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
