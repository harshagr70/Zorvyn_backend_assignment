const request = require("supertest");
const app = require("../../src/app");
const { createUser } = require("../fixtures/users");

describe("Users management API", () => {
  it("admin can list users", async () => {
    const { token } = await createUser("admin");
    await createUser("viewer");
    const response = await request(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it("non-admin cannot list users", async () => {
    const { token } = await createUser("analyst");
    const response = await request(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(403);
  });
});
