const request = require("supertest");
const app = require("../../src/app");
const User = require("../../src/modules/users/user.model");

describe("Auth API", () => {
  it("registers user and returns token", async () => {
    const response = await request(app).post("/api/v1/auth/register").send({
      name: "Auth Test",
      email: "auth@test.com",
      password: "password123",
    });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
  });

  it("rejects duplicate registration", async () => {
    await User.create({
      name: "Existing",
      email: "exists@test.com",
      password: "password123",
    });

    const response = await request(app).post("/api/v1/auth/register").send({
      name: "Another",
      email: "exists@test.com",
      password: "password123",
    });

    expect(response.statusCode).toBe(409);
  });

  it("logs in valid user", async () => {
    await User.create({
      name: "Login User",
      email: "login@test.com",
      password: "password123",
    });

    const response = await request(app).post("/api/v1/auth/login").send({
      email: "login@test.com",
      password: "password123",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.token).toBeDefined();
  });

  it("rejects bad password", async () => {
    await User.create({
      name: "Login User",
      email: "badpass@test.com",
      password: "password123",
    });

    const response = await request(app).post("/api/v1/auth/login").send({
      email: "badpass@test.com",
      password: "wrongpass",
    });

    expect(response.statusCode).toBe(401);
  });
});
