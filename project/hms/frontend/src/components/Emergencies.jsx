import { api } from "../libs/api";
import { Alert } from "./Alert";
import { LoadingSpinner } from "./LoadingSpinner";
import React, { useState, useEffect } from 'react';

import { 
  Plus, 
  Edit, 
  Save,
  X,
  AlertTriangle,
  Phone,
  Clock,
  User,
  Stethoscope,
  MapPin,
  Activity,
  Zap
} from 'lucide-react';

export const Emergencies = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEmergency, setEditingEmergency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    patientId: '', 
    doctorId: '', 
    type: '', 
    priority: 'medium', 
    description: '', 
    location: '', 
    status: 'active'
  });

  useEffect(() => {
    fetchEmergencies();
    fetchPatients();
    fetchDoctors();
  }, []);

  const fetchEmergencies = async () => {
    try {
      console.log('Fetching emergencies...');
      setLoading(true);
      const data = await api.get('/emergencies');
      console.log('Emergencies data:', data);
      setEmergencies(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching emergencies:', error);
      setError('Failed to load emergencies');
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

  const handleSubmit = async () => {
    try {
      if (editingEmergency) {
        await api.put(`/emergencies/${editingEmergency.id}`, formData);
      } else {
        await api.post('/emergencies', formData);
      }
      setFormData({ 
        patientId: '', 
        doctorId: '', 
        type: '', 
        priority: 'medium', 
        description: '', 
        location: '', 
        status: 'active' 
      });
      setShowForm(false);
      setEditingEmergency(null);
      fetchEmergencies();
    } catch (error) {
      setError('Failed to save emergency');
      console.error('Error saving emergency:', error);
    }
  };

  const handleEdit = (emergency) => {
    setEditingEmergency(emergency);
    setFormData({
      patientId: emergency.patientId || '',
      doctorId: emergency.doctorId || '',
      type: emergency.type || '',
      priority: emergency.priority || 'medium',
      description: emergency.description || '',
      location: emergency.location || '',
      status: emergency.status || 'active'
    });
    setShowForm(true);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-500';
      case 'high':
        return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-500';
      case 'medium':
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-yellow-500';
      case 'low':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-500';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
      case 'in-progress':
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
      case 'resolved':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
      case 'cancelled':
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) return <LoadingSpinner message="Loading emergencies..." />;

  return (
    <div className="space-y-8 animate-fadeIn">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-black to-black backdrop-blur-xl rounded-3xl border border-white p-8 hover:border-gray-600/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/10">
        <div className="absolute inset-0 bg-gradient-to-r from-black to-black border-white"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-800 rounded-2xl flex items-center justify-center border border-red-500">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-red-400 to-red-950 bg-clip-text text-transparent">
                  Emergency Management
                </h1>
                <p className="text-gray-300 text-lg">
                  Track and manage critical emergency cases with real-time monitoring
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-red-500 to-red-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Report Emergency
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-black backdrop-blur-sm rounded-xl p-4 border border-gray-300 hover:border-gray-600/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/10">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <span className="text-sm text-gray-300">Active</span>
              </div>
              <p className="text-2xl font-bold text-red-400 mt-1">
                {emergencies.filter(e => e.status === 'active').length}
              </p>
            </div>
            <div className="bg-black backdrop-blur-sm rounded-xl p-4 border border-gray-300 hover:border-gray-600/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/10">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-400" />
                <span className="text-sm text-gray-300">In Progress</span>
              </div>
              <p className="text-2xl font-bold text-yellow-400 mt-1">
                {emergencies.filter(e => e.status === 'in-progress').length}
              </p>
            </div>
            <div className="bg-black backdrop-blur-sm rounded-xl p-4 border border-gray-300 hover:border-gray-600/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/10">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-green-400" />
                <span className="text-sm text-gray-300">Resolved</span>
              </div>
              <p className="text-2xl font-bold text-green-400 mt-1">
                {emergencies.filter(e => e.status === 'resolved').length}
              </p>
            </div>
            <div className="bg-black backdrop-blur-sm rounded-xl p-4 border border-gray-300 hover:border-gray-600/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-purple-400" />
                <span className="text-sm text-gray-300">Total</span>
              </div>
              <p className="text-2xl font-bold text-purple-400 mt-1">{emergencies.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-black to-gray-900 backdrop-blur-xl rounded-3xl border border-gray-700 p-8 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-800 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-red-400 to-red-950 bg-clip-text text-transparent">
                  {editingEmergency ? 'Update Emergency' : 'Report New Emergency'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingEmergency(null);
                  setFormData({ 
                    patientId: '', 
                    doctorId: '', 
                    type: '', 
                    priority: 'medium', 
                    description: '', 
                    location: '', 
                    status: 'active' 
                  });
                }}
                className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Patient *
                  </label>
                  <select
                    value={formData.patientId}
                    onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all duration-300"
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
                    Assigned Doctor
                  </label>
                  <select
                    value={formData.doctorId}
                    onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all duration-300"
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.name} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Emergency Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all duration-300"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Cardiac Arrest">Cardiac Arrest</option>
                    <option value="Respiratory Distress">Respiratory Distress</option>
                    <option value="Trauma">Trauma</option>
                    <option value="Stroke">Stroke</option>
                    <option value="Seizure">Seizure</option>
                    <option value="Allergic Reaction">Allergic Reaction</option>
                    <option value="Overdose">Overdose</option>
                    <option value="Burns">Burns</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priority Level *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all duration-300"
                    required
                  >
                    <option value="critical">Critical (Life threatening)</option>
                    <option value="high">High (Urgent care needed)</option>
                    <option value="medium">Medium (Stable but needs attention)</option>
                    <option value="low">Low (Non-urgent)</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  placeholder="Room number, department, or specific location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all duration-300"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  placeholder="Detailed description of the emergency situation"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all duration-300"
                  rows="4"
                  required
                />
              </div>
              
              {editingEmergency && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all duration-300"
                  >
                    <option value="active">Active</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              )}
              
              <div className="flex gap-4 pt-6">
                <button 
                  type="button" 
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-red-500 to-red-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-2"
                >
                  <Save className="h-5 w-5" />
                  {editingEmergency ? 'Update' : 'Report'} Emergency
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingEmergency(null);
                    setFormData({ 
                      patientId: '', 
                      doctorId: '', 
                      type: '', 
                      priority: 'medium', 
                      description: '', 
                      location: '', 
                      status: 'active' 
                    });
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergencies Table */}
      <div className="bg-gradient-to-br from-black to-black backdrop-blur-xl rounded-2xl border border-gray-700 overflow-hidden">
        {emergencies.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Emergency Details</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Patient</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Doctor</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Priority</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Location</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Time</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {emergencies.map((emergency) => (
                  <tr key={emergency.id} className="hover:bg-gray-800/50 transition-colors duration-300">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-white mb-1">
                          {emergency.type}
                        </div>
                        <div className="text-sm text-gray-400 line-clamp-2">
                          {emergency.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-white">
                          {emergency.patientName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-300">
                          {emergency.doctorName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPriorityColor(emergency.priority)}`}>
                        {emergency.priority?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-300">
                          {emergency.location}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(emergency.status)}`}>
                        {emergency.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="h-4 w-4" />
                        <div>
                          <div className="text-gray-300">{formatDateTime(emergency.createdAt)}</div>
                          {emergency.updatedAt && emergency.updatedAt !== emergency.createdAt && (
                            <div className="text-xs text-gray-500">
                              Updated: {formatDateTime(emergency.updatedAt)}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleEdit(emergency)}
                        className="w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center text-white transition-all duration-300 hover:scale-105"
                        title="Edit Emergency"
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
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-700 to-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No emergencies reported</h3>
            <p className="text-gray-400 mb-8 text-lg">All systems normal. Emergency reports will appear here.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-red-500 to-red-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Report Emergency
            </button>
          </div>
        )}
      </div>
    </div>
  );
};