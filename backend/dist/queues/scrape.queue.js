"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeQueue = void 0;
const bullmq_1 = require("bullmq");
const connection_1 = require("../redis/connection");
exports.scrapeQueue = new bullmq_1.Queue("scrape-tasks", {
    connection: connection_1.connection,
});
