const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ContentRegistry", function () {
  let ContentRegistry;
  let registry;
  let owner;
  let otherAccount;

  // A dummy bytes32 hash to simulate a SHA-256 evidence fingerprint
  const DUMMY_HASH_1 = "0x8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92";
  const DUMMY_HASH_2 = "0xb94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9";
  const SCHEMA_VERSION = "1.0";

  beforeEach(async function () {
    [owner, otherAccount] = await ethers.getSigners();
    ContentRegistry = await ethers.getContractFactory("ContentRegistry");
    registry = await ContentRegistry.deploy();
  });

  describe("Registration and Verification", function () {
    it("1. Should allow a fresh registration", async function () {
      await expect(registry.registerContent(DUMMY_HASH_1, SCHEMA_VERSION)).to.not.be.reverted;
    });

    it("2. Should emit ContentRegistered event on registration", async function () {
      const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
      await expect(registry.registerContent(DUMMY_HASH_1, SCHEMA_VERSION))
        .to.emit(registry, "ContentRegistered")
        .withArgs(DUMMY_HASH_1, anyValue, owner.address);
    });

    it("3. Should store the record correctly", async function () {
      await registry.registerContent(DUMMY_HASH_1, SCHEMA_VERSION);
      const record = await registry.getRecord(DUMMY_HASH_1);
      
      expect(record.recordedAt).to.be.gt(0);
      expect(record.submitter).to.equal(owner.address);
      expect(record.schemaVersion).to.equal(SCHEMA_VERSION);
    });

    it("4. Should return true for verifyContent when registered", async function () {
      await registry.registerContent(DUMMY_HASH_1, SCHEMA_VERSION);
      const isVerified = await registry.verifyContent(DUMMY_HASH_1);
      expect(isVerified).to.be.true;
    });

    it("5. Should return false for unknown hash", async function () {
      const isVerified = await registry.verifyContent(DUMMY_HASH_2);
      expect(isVerified).to.be.false;
    });

    it("6. Should reject duplicate registration with custom error", async function () {
      await registry.registerContent(DUMMY_HASH_1, SCHEMA_VERSION);
      
      await expect(
        registry.registerContent(DUMMY_HASH_1, SCHEMA_VERSION)
      ).to.be.revertedWithCustomError(registry, "HashAlreadyRegistered")
       .withArgs(DUMMY_HASH_1);
    });

    it("7. Should store schema version correctly", async function () {
      await registry.registerContent(DUMMY_HASH_2, "1.1");
      const record = await registry.getRecord(DUMMY_HASH_2);
      expect(record.schemaVersion).to.equal("1.1");
    });
  });
});
