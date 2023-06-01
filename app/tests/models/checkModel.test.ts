// Libs
import assert from "node:assert";
import { describe, it, mock } from "node:test";

import { Model } from "sequelize";

import CheckModel from "../../src/models/checkModel";
import LoggerFactory from "../../src/logger/loggerFactory";

// Test
describe("CheckModel tests", () => {
  it("Start the migrations", async () => {
    // Mocks
    const syncMock = mock.setter(Model, "sync");
    const logger = LoggerFactory.createLogger("TESTS");

    // Execute
    await new CheckModel(logger).sync();

    // Asserts
    assert.equal(syncMock.mock.callCount(), 1);
  });
});
