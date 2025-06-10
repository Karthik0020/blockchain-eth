const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HMSRecords", function () {
  let HMSRecords;
  let hmsRecords;
  let owner;
  let doctor;
  let patient;
  let unauthorized;

  beforeEach(async function () {
    [owner, doctor, patient, unauthorized] = await ethers.getSigners();
    
    HMSRecords = await ethers.getContractFactory("HMSRecords");
    hmsRecords = await HMSRecords.deploy();
    await hmsRecords.waitForDeployment();

    // Grant doctor role
    await hmsRecords.grantDoctorRole(doctor.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const DEFAULT_ADMIN_ROLE = await hmsRecords.DEFAULT_ADMIN_ROLE();
      expect(await hmsRecords.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
    });

    it("Should grant admin role to deployer", async function () {
      const ADMIN_ROLE = await hmsRecords.ADMIN_ROLE();
      expect(await hmsRecords.hasRole(ADMIN_ROLE, owner.address)).to.be.true;
    });
  });

  describe("Patient Registration", function () {
    it("Should register a patient", async function () {
      const patientId = "patient123";
      const identityHash = ethers.keccak256(ethers.toUtf8Bytes("patient identity"));

      await expect(hmsRecords.registerPatient(patientId, identityHash))
        .to.emit(hmsRecords, "PatientRegistered");

      const registeredPatient = await hmsRecords.patients(patientId);
      expect(registeredPatient.isActive).to.be.true;
      expect(registeredPatient.identityHash).to.equal(identityHash);
    });

    it("Should not allow duplicate patient registration", async function () {
      const patientId = "patient123";
      const identityHash = ethers.keccak256(ethers.toUtf8Bytes("patient identity"));

      await hmsRecords.registerPatient(patientId, identityHash);
      
      await expect(hmsRecords.registerPatient(patientId, identityHash))
        .to.be.revertedWith("Patient already registered");
    });

    it("Should not allow non-admin to register patient", async function () {
      const patientId = "patient123";
      const identityHash = ethers.keccak256(ethers.toUtf8Bytes("patient identity"));

      await expect(hmsRecords.connect(unauthorized).registerPatient(patientId, identityHash))
        .to.be.reverted;
    });
  });

  describe("Medical Records", function () {
    beforeEach(async function () {
      const patientId = "patient123";
      const identityHash = ethers.keccak256(ethers.toUtf8Bytes("patient identity"));
      await hmsRecords.registerPatient(patientId, identityHash);
      await hmsRecords.authorizeDoctor(patientId, doctor.address);
    });

    it("Should add a medical record", async function () {
      const patientId = "patient123";
      const recordHash = ethers.keccak256(ethers.toUtf8Bytes("medical record data"));
      const recordType = "diagnosis";

      await expect(hmsRecords.connect(doctor).addRecord(patientId, recordHash, recordType))
        .to.emit(hmsRecords, "RecordAdded");

      const record = await hmsRecords.records(recordHash);
      expect(record.isActive).to.be.true;
      expect(record.patientId).to.equal(patientId);
      expect(record.recordType).to.equal(recordType);
    });

    it("Should not allow unauthorized user to add record", async function () {
      const patientId = "patient123";
      const recordHash = ethers.keccak256(ethers.toUtf8Bytes("medical record data"));
      const recordType = "diagnosis";

      await expect(hmsRecords.connect(unauthorized).addRecord(patientId, recordHash, recordType))
        .to.be.revertedWith("Not authorized to add records");
    });

    it("Should get patient records", async function () {
      const patientId = "patient123";
      const recordHash1 = ethers.keccak256(ethers.toUtf8Bytes("record 1"));
      const recordHash2 = ethers.keccak256(ethers.toUtf8Bytes("record 2"));

      await hmsRecords.connect(doctor).addRecord(patientId, recordHash1, "diagnosis");
      await hmsRecords.connect(doctor).addRecord(patientId, recordHash2, "treatment");

      const records = await hmsRecords.connect(doctor).getPatientRecords(patientId);
      expect(records.length).to.equal(2);
      expect(records[0]).to.equal(recordHash1);
      expect(records[1]).to.equal(recordHash2);
    });
  });

  describe("Doctor Authorization", function () {
    beforeEach(async function () {
      const patientId = "patient123";
      const identityHash = ethers.keccak256(ethers.toUtf8Bytes("patient identity"));
      await hmsRecords.registerPatient(patientId, identityHash);
    });

    it("Should authorize doctor", async function () {
      const patientId = "patient123";

      await expect(hmsRecords.authorizeDoctor(patientId, doctor.address))
        .to.emit(hmsRecords, "DoctorAuthorized")
        .withArgs(patientId, doctor.address, owner.address);

      expect(await hmsRecords.isAuthorizedDoctor(patientId, doctor.address)).to.be.true;
    });

    it("Should revoke doctor authorization", async function () {
      const patientId = "patient123";

      await hmsRecords.authorizeDoctor(patientId, doctor.address);
      expect(await hmsRecords.isAuthorizedDoctor(patientId, doctor.address)).to.be.true;

      await expect(hmsRecords.revokeDoctor(patientId, doctor.address))
        .to.emit(hmsRecords, "DoctorRevoked")
        .withArgs(patientId, doctor.address, owner.address);

      expect(await hmsRecords.isAuthorizedDoctor(patientId, doctor.address)).to.be.false;
    });
  });

  describe("Access Control", function () {
    it("Should grant and revoke doctor role", async function () {
      const newDoctor = unauthorized;
      const DOCTOR_ROLE = await hmsRecords.DOCTOR_ROLE();

      await hmsRecords.grantDoctorRole(newDoctor.address);
      expect(await hmsRecords.hasRole(DOCTOR_ROLE, newDoctor.address)).to.be.true;

      await hmsRecords.revokeDoctorRole(newDoctor.address);
      expect(await hmsRecords.hasRole(DOCTOR_ROLE, newDoctor.address)).to.be.false;
    });

    it("Should pause and unpause contract", async function () {
      await hmsRecords.pause();
      
      const patientId = "patient123";
      const identityHash = ethers.keccak256(ethers.toUtf8Bytes("patient identity"));

      await expect(hmsRecords.registerPatient(patientId, identityHash))
        .to.be.revertedWith("Pausable: paused");

      await hmsRecords.unpause();

      await expect(hmsRecords.registerPatient(patientId, identityHash))
        .to.emit(hmsRecords, "PatientRegistered");
    });
  });

  describe("Utility Functions", function () {
    it("Should return correct total counts", async function () {
      expect(await hmsRecords.getTotalPatients()).to.equal(0);
      expect(await hmsRecords.getTotalRecords()).to.equal(0);

      // Add a patient
      const patientId = "patient123";
      const identityHash = ethers.keccak256(ethers.toUtf8Bytes("patient identity"));
      await hmsRecords.registerPatient(patientId, identityHash);
      expect(await hmsRecords.getTotalPatients()).to.equal(1);

      // Add a record
      await hmsRecords.authorizeDoctor(patientId, doctor.address);
      const recordHash = ethers.keccak256(ethers.toUtf8Bytes("medical record"));
      await hmsRecords.connect(doctor).addRecord(patientId, recordHash, "diagnosis");
      expect(await hmsRecords.getTotalRecords()).to.equal(1);
    });

    it("Should verify record existence", async function () {
      const recordHash = ethers.keccak256(ethers.toUtf8Bytes("medical record"));
      expect(await hmsRecords.verifyRecord(recordHash)).to.be.false;

      // Add a record
      const patientId = "patient123";
      const identityHash = ethers.keccak256(ethers.toUtf8Bytes("patient identity"));
      await hmsRecords.registerPatient(patientId, identityHash);
      await hmsRecords.authorizeDoctor(patientId, doctor.address);
      await hmsRecords.connect(doctor).addRecord(patientId, recordHash, "diagnosis");

      expect(await hmsRecords.verifyRecord(recordHash)).to.be.true;
    });
  });
});