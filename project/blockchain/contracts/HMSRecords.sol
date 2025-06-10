// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title HMSRecords
 * @dev Smart contract for Hospital Management System record hashes
 * Stores only hashes of medical records, not the actual data
 */
contract HMSRecords is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant DOCTOR_ROLE = keccak256("DOCTOR_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    struct MedicalRecord {
        string patientId;
        bytes32 recordHash;
        uint256 timestamp;
        address authorizedBy;
        string recordType; // "appointment", "diagnosis", "treatment", etc.
        bool isActive;
    }
    
    struct Patient {
        string patientId;
        bytes32 identityHash; // Hash of patient identity data
        address[] authorizedDoctors;
        uint256 createdAt;
        bool isActive;
    }
    
    // Mappings
    mapping(string => Patient) public patients;
    mapping(bytes32 => MedicalRecord) public records;
    mapping(string => bytes32[]) public patientRecords;
    mapping(address => string[]) public doctorPatients;
    
    // Arrays for enumeration
    string[] public allPatientIds;
    bytes32[] public allRecordHashes;
    
    // Events
    event PatientRegistered(
        string indexed patientId,
        bytes32 identityHash,
        address indexed registeredBy,
        uint256 timestamp
    );
    
    event RecordAdded(
        string indexed patientId,
        bytes32 indexed recordHash,
        address indexed authorizedBy,
        string recordType,
        uint256 timestamp
    );
    
    event RecordUpdated(
        bytes32 indexed recordHash,
        address indexed updatedBy,
        uint256 timestamp
    );
    
    event DoctorAuthorized(
        string indexed patientId,
        address indexed doctor,
        address indexed authorizedBy
    );
    
    event DoctorRevoked(
        string indexed patientId,
        address indexed doctor,
        address indexed revokedBy
    );
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Register a new patient
     * @param patientId Unique patient identifier
     * @param identityHash Hash of patient identity data
     */
    function registerPatient(
        string memory patientId,
        bytes32 identityHash
    ) external onlyRole(ADMIN_ROLE) whenNotPaused {
        require(bytes(patientId).length > 0, "Patient ID cannot be empty");
        require(!patients[patientId].isActive, "Patient already registered");
        
        patients[patientId] = Patient({
            patientId: patientId,
            identityHash: identityHash,
            authorizedDoctors: new address[](0),
            createdAt: block.timestamp,
            isActive: true
        });
        
        allPatientIds.push(patientId);
        
        emit PatientRegistered(patientId, identityHash, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Add a medical record hash
     * @param patientId Patient identifier
     * @param recordHash Hash of the medical record
     * @param recordType Type of record (appointment, diagnosis, etc.)
     */
    function addRecord(
        string memory patientId,
        bytes32 recordHash,
        string memory recordType
    ) external whenNotPaused {
        require(patients[patientId].isActive, "Patient not found");
        require(recordHash != bytes32(0), "Record hash cannot be empty");
        require(
            hasRole(ADMIN_ROLE, msg.sender) || 
            hasRole(DOCTOR_ROLE, msg.sender) || 
            isAuthorizedDoctor(patientId, msg.sender),
            "Not authorized to add records"
        );
        require(!records[recordHash].isActive, "Record already exists");
        
        records[recordHash] = MedicalRecord({
            patientId: patientId,
            recordHash: recordHash,
            timestamp: block.timestamp,
            authorizedBy: msg.sender,
            recordType: recordType,
            isActive: true
        });
        
        patientRecords[patientId].push(recordHash);
        allRecordHashes.push(recordHash);
        
        emit RecordAdded(patientId, recordHash, msg.sender, recordType, block.timestamp);
    }
    
    /**
     * @dev Update a medical record (mark as updated, original hash remains)
     * @param recordHash Hash of the record to update
     */
    function updateRecord(bytes32 recordHash) external whenNotPaused {
        require(records[recordHash].isActive, "Record not found");
        require(
            hasRole(ADMIN_ROLE, msg.sender) || 
            records[recordHash].authorizedBy == msg.sender,
            "Not authorized to update this record"
        );
        
        emit RecordUpdated(recordHash, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Authorize a doctor to access patient records
     * @param patientId Patient identifier
     * @param doctor Doctor's address
     */
    function authorizeDoctor(
        string memory patientId,
        address doctor
    ) external onlyRole(ADMIN_ROLE) whenNotPaused {
        require(patients[patientId].isActive, "Patient not found");
        require(doctor != address(0), "Invalid doctor address");
        require(!isAuthorizedDoctor(patientId, doctor), "Doctor already authorized");
        
        patients[patientId].authorizedDoctors.push(doctor);
        doctorPatients[doctor].push(patientId);
        
        emit DoctorAuthorized(patientId, doctor, msg.sender);
    }
    
    /**
     * @dev Revoke doctor's access to patient records
     * @param patientId Patient identifier
     * @param doctor Doctor's address
     */
    function revokeDoctor(
        string memory patientId,
        address doctor
    ) external onlyRole(ADMIN_ROLE) whenNotPaused {
        require(patients[patientId].isActive, "Patient not found");
        require(isAuthorizedDoctor(patientId, doctor), "Doctor not authorized");
        
        // Remove doctor from patient's authorized list
        address[] storage authorizedDoctors = patients[patientId].authorizedDoctors;
        for (uint i = 0; i < authorizedDoctors.length; i++) {
            if (authorizedDoctors[i] == doctor) {
                authorizedDoctors[i] = authorizedDoctors[authorizedDoctors.length - 1];
                authorizedDoctors.pop();
                break;
            }
        }
        
        // Remove patient from doctor's patient list
        string[] storage doctorPatientList = doctorPatients[doctor];
        for (uint i = 0; i < doctorPatientList.length; i++) {
            if (keccak256(bytes(doctorPatientList[i])) == keccak256(bytes(patientId))) {
                doctorPatientList[i] = doctorPatientList[doctorPatientList.length - 1];
                doctorPatientList.pop();
                break;
            }
        }
        
        emit DoctorRevoked(patientId, doctor, msg.sender);
    }
    
    /**
     * @dev Check if a doctor is authorized for a patient
     * @param patientId Patient identifier
     * @param doctor Doctor's address
     * @return bool Authorization status
     */
    function isAuthorizedDoctor(
        string memory patientId,
        address doctor
    ) public view returns (bool) {
        address[] memory authorizedDoctors = patients[patientId].authorizedDoctors;
        for (uint i = 0; i < authorizedDoctors.length; i++) {
            if (authorizedDoctors[i] == doctor) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @dev Get patient records
     * @param patientId Patient identifier
     * @return bytes32[] Array of record hashes
     */
    function getPatientRecords(
        string memory patientId
    ) external view returns (bytes32[] memory) {
        require(
            hasRole(ADMIN_ROLE, msg.sender) || 
            isAuthorizedDoctor(patientId, msg.sender),
            "Not authorized to view records"
        );
        return patientRecords[patientId];
    }
    
    /**
     * @dev Get doctor's patients
     * @param doctor Doctor's address
     * @return string[] Array of patient IDs
     */
    function getDoctorPatients(
        address doctor
    ) external view returns (string[] memory) {
        require(
            hasRole(ADMIN_ROLE, msg.sender) || 
            doctor == msg.sender,
            "Not authorized to view doctor patients"
        );
        return doctorPatients[doctor];
    }
    
    /**
     * @dev Get total number of patients
     * @return uint256 Total patients count
     */
    function getTotalPatients() external view returns (uint256) {
        return allPatientIds.length;
    }
    
    /**
     * @dev Get total number of records
     * @return uint256 Total records count
     */
    function getTotalRecords() external view returns (uint256) {
        return allRecordHashes.length;
    }
    
    /**
     * @dev Verify a record hash exists
     * @param recordHash Hash to verify
     * @return bool Existence status
     */
    function verifyRecord(bytes32 recordHash) external view returns (bool) {
        return records[recordHash].isActive;
    }
    
    /**
     * @dev Get record details
     * @param recordHash Hash of the record
     * @return MedicalRecord Record details
     */
    function getRecord(
        bytes32 recordHash
    ) external view returns (MedicalRecord memory) {
        require(records[recordHash].isActive, "Record not found");
        require(
            hasRole(ADMIN_ROLE, msg.sender) || 
            isAuthorizedDoctor(records[recordHash].patientId, msg.sender) ||
            records[recordHash].authorizedBy == msg.sender,
            "Not authorized to view this record"
        );
        return records[recordHash];
    }
    
    /**
     * @dev Grant doctor role
     * @param doctor Address to grant doctor role
     */
    function grantDoctorRole(address doctor) external onlyRole(ADMIN_ROLE) {
        _grantRole(DOCTOR_ROLE, doctor);
    }
    
    /**
     * @dev Revoke doctor role
     * @param doctor Address to revoke doctor role
     */
    function revokeDoctorRole(address doctor) external onlyRole(ADMIN_ROLE) {
        _revokeRole(DOCTOR_ROLE, doctor);
    }
    
    /**
     * @dev Pause contract
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}