"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const postgres_js_1 = require("drizzle-orm/postgres-js");
const postgres_1 = __importDefault(require("postgres"));
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set. Please configure it in your .env file.");
}
// Parse DATABASE_URL to handle SSL requirements
let sslConfig = false;
if (databaseUrl.includes("sslmode=require") || databaseUrl.includes("ssl=true")) {
    sslConfig = { rejectUnauthorized: false };
}
else if (databaseUrl.includes("render.com")) {
    sslConfig = { rejectUnauthorized: false };
}
const queryClient = (0, postgres_1.default)(databaseUrl, {
    ssl: sslConfig,
    max: 10, // Connection pool size
    idle_timeout: 20,
    connect_timeout: 10,
});
exports.db = (0, postgres_js_1.drizzle)(queryClient);
console.log("Database connection initialized");
