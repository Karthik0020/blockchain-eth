import { api } from "../libs/api";
import { Alert } from "./Alert";
import { LoadingSpinner } from "./LoadingSpinner";
import React, { useState, useEffect } from 'react';

import { 
  Calendar,
  Plus, 
  Edit, 
  Save,
  X,
  Clock,
  User,
  Stethoscope,
  FileText,
  Activity,
  Zap,
} from 'lucide-react';

export const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    patientId: '', doctorId: '', date: '', time: '', reason: '', status: 'scheduled'
  });

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
    fetchDoctors();
  }, []);

  const fetchAppointments = async () => {
    try {
      console.log('Fetching appointments...');
      setLoading(true);
      const data = await api.get('/appointments');
      console.log('Appointments data:', data);
      setAppointments(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      console.log('Fetching patients...');
      const data = await api.get('/patients');
      console.log('Patients data:', data);
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      console.log('Fetching doctors...');
      const data = await api.get('/doctors');
      console.log('Doctors data:', data);
      setDoctors(data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAppointment) {
        await api.put(`/appointments/${editingAppointment.id}`, formData);
      } else {
        await api.post('/appointments', formData);
      }
      setFormData({ patientId: '', doctorId: '', date: '', time: '', reason: '', status: 'scheduled' });
      setShowForm(false);
      setEditingAppointment(null);
      fetchAppointments();
      setLoading(false);
    } catch (error) {
      setError('Failed to save appointment');
      console.error('Error saving appointment:', error);
    }
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      date: appointment.date?.split('T')[0] || '',
      time: appointment.time || '',
      reason: appointment.reason || '',
      status: appointment.status
    });
    setShowForm(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'from-green-500 to-green-600';
      case 'scheduled': return 'from-blue-500 to-blue-600';
      case 'cancelled': return 'from-red-500 to-red-600';
      case 'rescheduled': return 'from-amber-500 to-amber-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-200';
      case 'scheduled': return 'text-blue-200';
      case 'cancelled': return 'text-red-200';
      case 'rescheduled': return 'text-amber-200';
      default: return 'text-gray-200';
    }
  };

  if (loading) return <LoadingSpinner message="Loading appointments..." />;

  return (
    <div className="space-y-8 animate-fadeIn">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-black to-black backdrop-blur-xl rounded-3xl border border-white p-8 hover:border-gray-600/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10">
        <div className="absolute inset-0 bg-gradient-to-r from-black to-black border-white"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-black to-blue-800 rounded-2xl flex items-center justify-center border border-blue-500">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-400 to-blue-950 bg-clip-text text-transparent">
                  Appointments
                </h1>
                <p className="text-gray-300 text-lg">Schedule and manage patient appointments with precision</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowForm(true)}
              className="w-full md:w-auto flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-black to-blue-800 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20"
            >
              <Plus className="h-5 w-5" />
              <span>Schedule Appointment</span>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-black backdrop-blur-sm rounded-xl p-4 border border-gray-300 hover:border-gray-600/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-200" />
                <span className="text-sm text-gray-300">Total</span>
              </div>
              <p className="text-2xl font-bold text-blue-200 mt-1">{appointments.length}</p>
            </div>
            <div className="bg-black backdrop-blur-sm rounded-xl p-4 border border-gray-300 hover:border-gray-600/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-green-200" />
                <span className="text-sm text-gray-300">Scheduled</span>
              </div>
              <p className="text-2xl font-bold text-green-200 mt-1">
                {appointments.filter(apt => apt.status === 'scheduled').length}
              </p>
            </div>
            <div className="bg-black backdrop-blur-sm rounded-xl p-4 border border-gray-300 hover:border-gray-600/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-amber-200" />
                <span className="text-sm text-gray-300">Today</span>
              </div>
              <p className="text-2xl font-bold text-amber-200 mt-1">
                {appointments.filter(apt => new Date(apt.date).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
            <div className="bg-black backdrop-blur-sm rounded-xl p-4 border border-gray-300 hover:border-gray-600/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-purple-200" />
                <span className="text-sm text-gray-300">Completed</span>
              </div>
              <p className="text-2xl font-bold text-purple-200 mt-1">
                {appointments.filter(apt => apt.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-black to-black backdrop-blur-xl rounded-2xl border border-gray-700 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {editingAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingAppointment(null);
                  setFormData({ patientId: '', doctorId: '', date: '', time: '', reason: '', status: 'scheduled' });
                }}
                className="text-gray-400 hover:text-white transition-colors duration-200 p-2 hover:bg-gray-800 rounded-lg"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Patient *
                </label>
                <select
                  value={formData.patientId}
                  onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                  className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <Stethoscope className="h-4 w-4 mr-2" />
                  Doctor *
                </label>
                <select
                  value={formData.doctorId}
                  onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
                  className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Time
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Reason for Visit
                </label>
                <textarea
                  placeholder="Enter reason for appointment"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  rows="3"
                />
              </div>
              
              {editingAppointment && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                    <Activity className="h-4 w-4 mr-2" />
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="rescheduled">Rescheduled</option>
                  </select>
                </div>
              )}
              
              <div className="flex gap-4 pt-6">
                <button 
                  type="submit" 
                  className="flex-1 flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingAppointment ? 'Update' : 'Schedule'} Appointment</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAppointment(null);
                    setFormData({ patientId: '', doctorId: '', date: '', time: '', reason: '', status: 'scheduled' });
                  }}
                  className="flex-1 p-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointments List */}
      <div className="bg-gradient-to-br from-black to-black backdrop-blur-xl rounded-2xl border border-gray-700 overflow-hidden">
        {appointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black border-b border-gray-700">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Patient</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Doctor</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Date & Time</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Reason</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {appointments.map((appointment, idx) => (
                  <tr 
                    key={appointment.id}
                    className="hover:bg-black transition-colors duration-200"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div className="font-medium text-white">
                          {appointment.patientName}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                          <Stethoscope className="h-4 w-4 text-white" />
                        </div>
                        <div className="font-medium text-white">
                          {appointment.doctorName}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <div className="font-medium text-white">
                          {new Date(appointment.date).toLocaleDateString()}
                        </div>
                        {appointment.time && (
                          <div className="text-gray-400 flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {appointment.time}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-300">
                        {appointment.reason || 'Not specified'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getStatusColor(appointment.status)} ${getStatusTextColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleEdit(appointment)}
                        className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-gray-800 transition-all duration-200"
                        title="Edit Appointment"
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
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No appointments scheduled</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Start managing your healthcare schedule by creating your first appointment.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center space-x-2 p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20"
            >
              <Plus className="h-5 w-5" />
              <span>Schedule First Appointment</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};