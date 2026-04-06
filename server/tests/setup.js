const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const path = require("path");
const fs = require("fs");

// Hook timeout for mongodb-memory-server (first binary download); set here, not inside beforeAll.
jest.setTimeout(120000);

let mongoServer;

beforeAll(async () => {
  const downloadDir = path.join(__dirname, "../.mongodb-binaries");
  fs.mkdirSync(downloadDir, { recursive: true });

  mongoServer = await MongoMemoryServer.create({
    binary: { downloadDir, version: "7.0.14" },
  });
  process.env.MONGODB_URI = mongoServer.getUri();
  await mongoose.connect(process.env.MONGODB_URI);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  const cleanups = Object.values(collections).map((collection) => collection.deleteMany({}));
  await Promise.all(cleanups);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) await mongoServer.stop();
});
