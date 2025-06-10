import { api } from "../libs/api";
import { Alert } from "./Alert";
import { LoadingSpinner } from "./LoadingSpinner";
import React, { useState, useEffect } from 'react';

import {
  Plus,
  Edit,
  Save,
  X,
  Bed,
  Filter,
  Users,
  Clock,
  CheckCircle,
  ArrowDownRight,
  ArrowRightCircle,
  Zap,
  TrendingUp,
  UserPlus
} from 'lucide-react';

export const Admissions = () => {
  const [admissions, setAdmissions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAdmission, setEditingAdmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterPatient, setFilterPatient] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [admissionsStats, setAdmissionsStats] = useState({
    totalActive: 0,
    totalDischarged: 0,
    avgLengthOfStay: 'N/A',
    emergencyAdmissions: 0,
  });

  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    roomId: '',
    admissionType: 'planned',
    admissionReason: '',
    diagnosis: '',
    admissionDate: '',
    estimatedDischargeDate: '',
    dischargeDate: '',
    emergencyContact: '',
    emergencyContactPhone: '',
    medicalHistory: '',
    allergies: '',
    currentMedications: '',
    admissionNotes: '',
    dischargeNotes: '',
    status: 'active',
    priority: 'routine'
  });

  useEffect(() => {
    fetchAdmissions();
    fetchPatients();
    fetchDoctors();
    fetchRooms();
  }, []);

  useEffect(() => {
    calculateAdmissionsStats();
  }, [admissions]);

  const fetchAdmissions = async () => {
    try {
      console.log('Fetching admissions...');
      setLoading(true);
      const data = await api.get('/admissions');
      console.log('Admissions data:', data);
      setAdmissions(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching admissions:', error);
      setError('Failed to load admissions');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const data = await api.get('/patients');
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const data = await api.get('/doctors');
      setDoctors(data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchRooms = async () => {
    try {
      const data = await api.get('/rooms');
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const calculateAdmissionsStats = () => {
    const active = admissions.filter(adm => adm.status === 'active').length;
    const discharged = admissions.filter(adm => adm.status === 'discharged').length;
    const emergency = admissions.filter(adm => adm.admissionType === 'emergency').length;

    let totalLengthOfStay = 0;
    let dischargedCount = 0;

    admissions.forEach(adm => {
      if (adm.status === 'discharged' && adm.admissionDate && adm.dischargeDate) {
        const admissionDate = new Date(adm.admissionDate);
        const dischargeDate = new Date(adm.dischargeDate);
        const diffTime = Math.abs(dischargeDate - admissionDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        totalLengthOfStay += diffDays;
        dischargedCount++;
      }
    });

    const avgStay = dischargedCount > 0 ? (totalLengthOfStay / dischargedCount).toFixed(1) : 'N/A';

    setAdmissionsStats({
      totalActive: active,
      totalDischarged: discharged,
      avgLengthOfStay: avgStay,
      emergencyAdmissions: emergency,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        admissionDate: formData.admissionDate || new Date().toISOString().split('T')[0]
      };

      if (editingAdmission) {
        await api.put(`/admissions/${editingAdmission.id}`, submitData);
      } else {
        await api.post('/admissions', submitData);
      }

      setFormData({
        patientId: '',
        doctorId: '',
        roomId: '',
        admissionType: 'planned',
        admissionReason: '',
        diagnosis: '',
        admissionDate: '',
        estimatedDischargeDate: '',
        dischargeDate: '',
        emergencyContact: '',
        emergencyContactPhone: '',
        medicalHistory: '',
        allergies: '',
        currentMedications: '',
        admissionNotes: '',
        dischargeNotes: '',
        status: 'active',
        priority: 'routine'
      });
      setShowForm(false);
      setEditingAdmission(null);
      fetchAdmissions();
      fetchRooms(); // Refresh rooms to update availability
    } catch (error) {
      setError('Failed to save admission');
      console.error('Error saving admission:', error);
    }
  };

  const handleEdit = (admission) => {
    setEditingAdmission(admission);
    setFormData({
      patientId: admission.patientId || '',
      doctorId: admission.doctorId || '',
      roomId: admission.roomId || '',
      admissionType: admission.admissionType || 'planned',
      admissionReason: admission.admissionReason || '',
      diagnosis: admission.diagnosis || '',
      admissionDate: admission.admissionDate?.split('T')[0] || '',
      estimatedDischargeDate: admission.estimatedDischargeDate?.split('T')[0] || '',
      dischargeDate: admission.dischargeDate?.split('T')[0] || '',
      emergencyContact: admission.emergencyContact || '',
      emergencyContactPhone: admission.emergencyContactPhone || '',
      medicalHistory: admission.medicalHistory || '',
      allergies: admission.allergies || '',
      currentMedications: admission.currentMedications || '',
      admissionNotes: admission.admissionNotes || '',
      dischargeNotes: admission.dischargeNotes || '',
      status: admission.status || 'active',
      priority: admission.priority || 'routine'
    });
    setShowForm(true);
  };

  const filteredAdmissions = admissions.filter(admission => {
    const patientMatch = !filterPatient || admission.patientId === filterPatient;
    const statusMatch = !filterStatus || admission.status === filterStatus;
    return patientMatch && statusMatch;
  });

  // Get available rooms (not occupied)
  const availableRooms = rooms.filter(room => room.status !== 'occupied' || room.id === formData.roomId);

  const admissionStatCards = [
    {
      label: "Active Admissions",
      value: admissionsStats.totalActive,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      trend: "up",
    },
    {
      label: "Discharged Patients",
      value: admissionsStats.totalDischarged,
      icon: CheckCircle,
      color: "from-emerald-500 to-emerald-600",
      trend: "up",
    },
    {
      label: "Avg. Length of Stay",
      value: admissionsStats.avgLengthOfStay + (admissionsStats.avgLengthOfStay !== 'N/A' ? ' days' : ''),
      icon: Clock,
      color: "from-amber-500 to-amber-600",
      trend: "neutral",
    },
    {
      label: "Emergency Admissions",
      value: admissionsStats.emergencyAdmissions,
      icon: Zap,
      color: "from-red-500 to-red-600",
      trend: "up",
    },
  ];

  if (loading) return <LoadingSpinner message="Loading admissions..." />;

  return (
    <div className="p-6 fade-in min-h-screen bg-gradient-to-br from-black to-black text-gray-100">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Patient Admissions Management</h1>
          <p className="text-gray-400">Oversee patient admissions, discharges, and bed assignments.</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="relative">
            <Filter className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={filterPatient}
              onChange={(e) => setFilterPatient(e.target.value)}
              className="form-select pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
            >
              <option value="">All Patients</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-select pl-4 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="discharged">Discharged</option>
              <option value="transferred">Transferred</option>
            </select>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex items-center gap-2 py-2 px-4 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            New Admission
          </button>
        </div>
      </div>

      {/* Admissions Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {admissionStatCards.map(({ label, value, icon: Icon, color, trend }, idx) => (
          <div
            key={idx}
            className="group relative bg-gradient-to-br from-black to-black rounded-2xl border border-gray-700 p-6 hover:border-blue-500/50 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10 animate-fade-in"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500`}
            ></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div
                  className={`flex items-center space-x-1 text-sm ${
                    trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-gray-400"
                  }`}
                >
                  {trend === "up" ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : trend === "down" ? (
                    <ArrowDownRight className="h-4 w-4" />
                  ) : null}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-1">{label}</p>
                <p className="text-3xl font-bold text-white">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>


      {/* Admission Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-black to-black backdrop-blur-xl rounded-3xl border border-gray-600 p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  {editingAdmission ? <Edit className="h-6 w-6 text-white" /> : <UserPlus className="h-6 w-6 text-white" />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {editingAdmission ? 'Edit Patient Admission' : 'Add New Patient Admission'}
                  </h2>
                  <p className="text-gray-400">
                    {editingAdmission ? 'Update patient admission information' : 'Create a comprehensive patient admission record'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingAdmission(null);
                  setFormData({
                    patientId: '',
                    doctorId: '',
                    roomId: '',
                    admissionType: 'planned',
                    admissionReason: '',
                    diagnosis: '',
                    admissionDate: '',
                    estimatedDischargeDate: '',
                    dischargeDate: '',
                    emergencyContact: '',
                    emergencyContactPhone: '',
                    medicalHistory: '',
                    allergies: '',
                    currentMedications: '',
                    admissionNotes: '',
                    dischargeNotes: '',
                    status: 'active',
                    priority: 'routine'
                  });
                }}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Patient *
                    </label>
                    <select
                      value={formData.patientId}
                      onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      required
                    >
                      <option value="">Select Patient</option>
                      {patients.map((patient) => (
                        <option key={patient.id} value={patient.id}>
                          {patient.name} - {patient.phone}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Attending Doctor *
                    </label>
                    <select
                      value={formData.doctorId}
                      onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      required
                    >
                      <option value="">Select Doctor</option>
                      {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.name} - {doctor.specialization}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Room Assignment
                    </label>
                    <select
                      value={formData.roomId}
                      onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="">Select Room</option>
                      {availableRooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.number} - {room.type} ({room.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Admission Type *
                    </label>
                    <select
                      value={formData.admissionType}
                      onChange={(e) => setFormData({ ...formData, admissionType: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      required
                    >
                      <option value="planned">Planned</option>
                      <option value="emergency">Emergency</option>
                      <option value="urgent">Urgent</option>
                      <option value="transfer">Transfer</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Admission Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Admission Reason *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Chest pain, Surgery, Observation"
                      value={formData.admissionReason}
                      onChange={(e) => setFormData({ ...formData, admissionReason: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Primary Diagnosis
                    </label>
                    <input
                      type="text"
                      placeholder="Primary diagnosis or suspected condition"
                      value={formData.diagnosis}
                      onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Priority Level
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="routine">Routine</option>
                      <option value="urgent">Urgent</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Admission Date *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.admissionDate}
                      onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Dates and Status */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Estimated Discharge
                    </label>
                    <input
                      type="date"
                      value={formData.estimatedDischargeDate}
                      onChange={(e) => setFormData({ ...formData, estimatedDischargeDate: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Discharge Date
                    </label>
                    <input
                      type="date"
                      value={formData.dischargeDate}
                      onChange={(e) => setFormData({ ...formData, dischargeDate: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      disabled={formData.status === 'active'}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="active">Active</option>
                      <option value="discharged">Discharged</option>
                      <option value="transferred">Transferred</option>
                    </select>
                  </div>
                </div>
              </div>


              {/* Emergency Contact */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Emergency Contact Name
                    </label>
                    <input
                      type="text"
                      placeholder="Contact person name"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Emergency Contact Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="Contact phone number"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Medical History
                  </label>
                  <textarea
                    placeholder="Relevant medical history"
                    value={formData.medicalHistory}
                    onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                    rows="3"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Known Allergies
                    </label>
                    <textarea
                      placeholder="List any known allergies"
                      value={formData.allergies}
                      onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Current Medications
                    </label>
                    <textarea
                      placeholder="List current medications"
                      value={formData.currentMedications}
                      onChange={(e) => setFormData({ ...formData, currentMedications: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                      rows="3"
                    />
                  </div>
                </div>
              </div>


              {/* Notes */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Admission Notes
                  </label>
                  <textarea
                    placeholder="Additional notes about the admission"
                    value={formData.admissionNotes}
                    onChange={(e) => setFormData({ ...formData, admissionNotes: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                    rows="3"
                  />
                </div>

                {(editingAdmission || formData.status === 'discharged') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Discharge Notes
                    </label>
                    <textarea
                      placeholder="Discharge summary and instructions"
                      value={formData.dischargeNotes}
                      onChange={(e) => setFormData({ ...formData, dischargeNotes: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                      rows="3"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-700 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAdmission(null);
                    setFormData({
                      patientId: '',
                      doctorId: '',
                      roomId: '',
                      admissionType: 'planned',
                      admissionReason: '',
                      diagnosis: '',
                      admissionDate: '',
                      estimatedDischargeDate: '',
                      dischargeDate: '',
                      emergencyContact: '',
                      emergencyContactPhone: '',
                      medicalHistory: '',
                      allergies: '',
                      currentMedications: '',
                      admissionNotes: '',
                      dischargeNotes: '',
                      status: 'active',
                      priority: 'routine'
                    });
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-2"
                >
                  <Save className="h-5 w-5" />
                  {editingAdmission ? 'Update Admission' : 'Add Admission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admissions Table */}
      <div className="bg-black rounded-2xl shadow-lg border border-white overflow-hidden animate-fade-in-up">
        {filteredAdmissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table-auto w-full text-left">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-gray-300 text-sm font-semibold uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-gray-300 text-sm font-semibold uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-3 text-gray-300 text-sm font-semibold uppercase tracking-wider">Room</th>
                  <th className="px-6 py-3 text-gray-300 text-sm font-semibold uppercase tracking-wider">Admission Details</th>
                  <th className="px-6 py-3 text-gray-300 text-sm font-semibold uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-3 text-gray-300 text-sm font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-gray-300 text-sm font-semibold uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-gray-300 text-sm font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredAdmissions.map((admission) => (
                  <tr key={admission.id} className="bg-gray-900 hover:bg-gray-800 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-white">
                        {admission.patientName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-400">
                        {admission.doctorName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-400">
                        {admission.roomNumber || 'Unassigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-white">
                          {admission.admissionReason}
                        </div>
                        <div className="text-sm text-gray-500">
                          {admission.admissionType} admission
                        </div>
                        {admission.diagnosis && (
                          <div className="text-sm text-gray-400">
                            {admission.diagnosis}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      <div>Admitted: {new Date(admission.admissionDate || admission.createdAt).toLocaleDateString()}</div>
                      {admission.estimatedDischargeDate && (
                        <div className="text-blue-400">
                          Est. Discharge: {new Date(admission.estimatedDischargeDate).toLocaleDateString()}
                        </div>
                      )}
                      {admission.dischargeDate && (
                        <div className="text-green-400">
                          Discharged: {new Date(admission.dischargeDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        admission.status === 'active' ? 'bg-green-600 text-white' :
                        admission.status === 'discharged' ? 'bg-gray-600 text-white' :
                        admission.status === 'transferred' ? 'bg-blue-600 text-white' :
                        'bg-yellow-600 text-white'
                      }`}>
                        {admission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        admission.priority === 'critical' ? 'bg-red-600 text-white' :
                        admission.priority === 'urgent' ? 'bg-orange-600 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {admission.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(admission)}
                        className="text-blue-500 hover:text-blue-300 p-2 rounded-full hover:bg-gray-700 transition-colors duration-200"
                        title="Edit Admission"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
            <div className="text-center py-12">
              <Bed className="h-16 w-16 mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No admissions found</h3>
              <p className="text-gray-400 mb-6">Create your first patient admission to get started. </p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex items-center gap-2 py-2 px-4 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 mx-auto"
              >
                <Plus className="h-4 w-4" />
                Create First Admission
              </button>
            </div>
          )}
      </div>
    </div>
  );
};