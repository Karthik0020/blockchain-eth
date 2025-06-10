import { api } from "../libs/api";
import { Alert } from "./Alert";
import { LoadingSpinner } from "./LoadingSpinner";
import {  
  FileText, 
  Plus, 
  Save,
  X,
  Calendar,
  User,
  Stethoscope,
  Activity,
  Search,
  Filter,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

export const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [formData, setFormData] = useState({
    patientId: '', doctorId: '', diagnosis: '', treatment: '', notes: '', date: ''
  });

  useEffect(() => {
    fetchRecords();
    fetchPatients();
    fetchDoctors();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await api.get('/medical-records');
      setRecords(data);
      setError(null);
    } catch (error) {
      setError('Failed to load medical records');
      console.error('Error fetching records:', error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/medical-records', {
        ...formData,
        date: formData.date || new Date().toISOString().split('T')[0]
      });
      setFormData({ patientId: '', doctorId: '', diagnosis: '', treatment: '', notes: '', date: '' });
      setShowForm(false);
      fetchRecords();
    } catch (error) {
      setError('Failed to save medical record');
      console.error('Error saving record:', error);
    }
  };

  const filteredRecords = selectedPatient 
    ? records.filter(record => record.patientId === selectedPatient)
    : records;

  if (loading) return <LoadingSpinner message="Loading medical records..." />;

  return (
    <div className="space-y-8 animate-fadeIn min-h-screen bg-black text-white">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-black to-black backdrop-blur-xl rounded-3xl border border-gray-700 p-8 hover:border-gray-600/50 transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-black to-black"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-800 rounded-2xl flex items-center justify-center border border-purple-500/20">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-400 to-purple-600 bg-clip-text text-transparent">
                  Medical Records
                </h1>
                <p className="text-gray-300 text-lg mt-2">
                  Comprehensive patient medical history and records management
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="group relative bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 flex items-center gap-3"
            >
              <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
              Add Medical Record
            </button>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-gradient-to-br from-black to-black backdrop-blur-xl rounded-2xl border border-gray-700 p-6 hover:border-gray-600/50 transition-all duration-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-3 mb-4">
            <Filter className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Filters</h3>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Filter by Patient
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              >
                <option value="">All Patients</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Medical Record Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-black to-black backdrop-blur-xl rounded-3xl border border-gray-700 shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-800 rounded-xl flex items-center justify-center">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-400 to-purple-600 bg-clip-text text-transparent">
                    Add Medical Record
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ patientId: '', doctorId: '', diagnosis: '', treatment: '', notes: '', date: '' });
                  }}
                  className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Patient *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        value={formData.patientId}
                        onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-black border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
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
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Doctor *
                    </label>
                    <div className="relative">
                      <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        value={formData.doctorId}
                        onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-black border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
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
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-black border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Diagnosis *
                  </label>
                  <textarea
                    placeholder="Enter detailed diagnosis..."
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                    className="w-full p-4 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none"
                    rows="4"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Treatment *
                  </label>
                  <textarea
                    placeholder="Enter treatment details and prescriptions..."
                    value={formData.treatment}
                    onChange={(e) => setFormData({...formData, treatment: e.target.value})}
                    className="w-full p-4 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none"
                    rows="4"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    placeholder="Enter additional notes, observations, or follow-up instructions..."
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full p-4 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none"
                    rows="3"
                  />
                </div>
                
                <div className="flex gap-4 pt-6">
                  <button 
                    type="submit" 
                    className="flex-1 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 flex items-center justify-center gap-3"
                  >
                    <Save className="h-5 w-5" />
                    Save Medical Record
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setFormData({ patientId: '', doctorId: '', diagnosis: '', treatment: '', notes: '', date: '' });
                    }}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Medical Records List */}
      <div className="space-y-6">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record, idx) => (
            <div 
              key={record.id} 
              className="group relative bg-gradient-to-br from-black to-black backdrop-blur-xl rounded-2xl border border-gray-700 p-8 hover:border-gray-600/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-800/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-800 rounded-xl flex items-center justify-center">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        {record.patientName}
                      </h3>
                      <p className="text-gray-300 flex items-center gap-2">
                        <Stethoscope className="h-4 w-4" />
                        Treated by {record.doctorName}
                      </p>
                    </div>
                  </div>
                  <div className="bg-black backdrop-blur-sm rounded-xl p-3 border border-gray-700">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">
                        {record.date ? new Date(record.date).toLocaleDateString() : 
                         record.createdAt ? new Date(record.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="bg-black backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-400" />
                      Diagnosis
                    </h4>
                    <p className="text-gray-300 leading-relaxed">
                      {record.diagnosis}
                    </p>
                  </div>
                  
                  <div className="bg-black backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-green-400" />
                      Treatment
                    </h4>
                    <p className="text-gray-300 leading-relaxed">
                      {record.treatment}
                    </p>
                  </div>
                </div>
                
                {record.notes && (
                  <div className="bg-black backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-6">
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-purple-400" />
                      Additional Notes
                    </h4>
                    <p className="text-gray-300 leading-relaxed">
                      {record.notes}
                    </p>
                  </div>
                )}
                
                <div className="pt-4 border-t border-gray-700">
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Record ID: {record.id}</span>
                    <span>Created: {record.createdAt ? new Date(record.createdAt).toLocaleString() : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-purple-800/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="h-12 w-12 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">No medical records found</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              {selectedPatient ? 'No records found for the selected patient.' : 'Start building comprehensive medical histories by adding your first medical record.'}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 inline-flex items-center gap-3"
            >
              <Plus className="h-5 w-5" />
              Add First Medical Record
            </button>
          </div>
        )}
      </div>
    </div>
  );
};