const request = require("supertest");
const app = require("../../src/app");
const { createUser } = require("../fixtures/users");
const { createRecord } = require("../fixtures/records");

describe("Records permission boundaries", () => {
  it("viewer cannot create record", async () => {
    const { token } = await createUser("viewer");
    const response = await request(app)
      .post("/api/v1/records")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 100,
        type: "expense",
        category: "food",
        date: new Date().toISOString(),
      });

    expect(response.statusCode).toBe(403);
  });

  it("analyst can update own record", async () => {
    const { user, token } = await createUser("analyst");
    const record = await createRecord({ createdBy: user._id, updatedBy: user._id });
    const response = await request(app)
      .patch(`/api/v1/records/${record._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 2222 });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.amount).toBe(2222);
  });

  it("analyst cannot update someone else's record", async () => {
    const { user: owner } = await createUser("analyst");
    const { token } = await createUser("analyst");
    const record = await createRecord({ createdBy: owner._id, updatedBy: owner._id });
    const response = await request(app)
      .patch(`/api/v1/records/${record._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 2222 });

    expect(response.statusCode).toBe(403);
  });

  it("admin can delete record", async () => {
    const { user: owner } = await createUser("analyst");
    const { token } = await createUser("admin");
    const record = await createRecord({ createdBy: owner._id, updatedBy: owner._id });
    const response = await request(app)
      .delete(`/api/v1/records/${record._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
  });
});
