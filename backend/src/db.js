import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let memoryServer;

export async function connectDB() {
  let uri = process.env.MONGODB_URI?.trim();
  if (!uri || uri === "memory") {
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri();
    console.log("MongoDB (in-memory) started – no install needed");
    await mongoose.connect(uri);
    console.log("MongoDB connected");
    return;
  }
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (err) {
    console.warn("MongoDB connection failed:", err.message);
    console.log("Falling back to in-memory MongoDB (data resets on restart)...");
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri();
    await mongoose.connect(uri);
    console.log("MongoDB (in-memory) connected");
  }
}
