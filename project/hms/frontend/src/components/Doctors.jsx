import { api } from "../libs/api";
import { Alert } from "./Alert";
import { LoadingSpinner } from "./LoadingSpinner";
import React, { useState, useEffect } from 'react';

import { 
  Plus, 
  Edit, 
  Save,
  X,
  Clock,
  Search,
  Settings,
  Phone,
  Mail,
  Stethoscope,
  User,
  Award,
  Calendar,
  Star,
  Activity
} from 'lucide-react';

export const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '', specialization: '', email: '', phone: '', experience: '', qualification: ''
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const data = await api.get('/doctors');
      setDoctors(data);
      setError(null);
    } catch (error) {
      setError('Failed to load doctors');
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDoctor) {
        await api.put(`/doctors/${editingDoctor.id}`, formData);
      } else {
        await api.post('/doctors', formData);
      }
      setFormData({ name: '', specialization: '', email: '', phone: '', experience: '', qualification: '' });
      setShowForm(false);
      setEditingDoctor(null);
      fetchDoctors();
    } catch (error) {
      setError('Failed to save doctor');
      console.error('Error saving doctor:', error);
    }
  };

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name,
      specialization: doctor.specialization,
      email: doctor.email,
      phone: doctor.phone,
      experience: doctor.experience || '',
      qualification: doctor.qualification || ''
    });
    setShowForm(true);
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const specializationColors = {
    'Cardiology': 'from-red-500 to-red-600',
    'Neurology': 'from-purple-500 to-purple-600',
    'Orthopedics': 'from-blue-500 to-blue-600',
    'Pediatrics': 'from-green-500 to-green-600',
    'Dermatology': 'from-pink-500 to-pink-600',
    'Oncology': 'from-orange-500 to-orange-600',
    'Psychiatry': 'from-indigo-500 to-indigo-600',
    'Radiology': 'from-cyan-500 to-cyan-600',
    'Surgery': 'from-rose-500 to-rose-600',
    'default': 'from-emerald-500 to-emerald-600'
  };

  const getSpecializationColor = (specialization) => {
    return specializationColors[specialization] || specializationColors['default'];
  };

  if (loading) return <LoadingSpinner message="Loading doctors..." />;

  return (
    <div className="space-y-8 animate-fadeIn">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-black to-black backdrop-blur-xl rounded-3xl border border-white p-8 hover:border-gray-600/50 transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl hover:shadow-emerald-500/10">
        <div className="absolute inset-0 bg-gradient-to-r from-black to-black opacity-90"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-black to-emerald-600 rounded-2xl border border-emerald-500 flex items-center justify-center border border-emerald-400/20">
                <Stethoscope className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-emerald-400  to-emerald-600 bg-clip-text text-transparent">
                  Medical Professionals
                </h1>
                <p className="text-gray-300 text-lg mt-2">
                  Manage your healthcare specialists and medical staff
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-black to-emerald-600 border border-emerald-500 text-white font-medium rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25"
            >
              <Plus className="h-5 w-5" />
              <span>Add Doctor</span>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 hover:scale-105">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-400" />
                <span className="text-sm text-gray-300">Total Doctors</span>
              </div>
              <p className="text-2xl font-bold text-blue-400 mt-1">{doctors.length}</p>
            </div>
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 hover:scale-105">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="text-sm text-gray-300">Specializations</span>
              </div>
              <p className="text-2xl font-bold text-yellow-400 mt-1">
                {new Set(doctors.map(d => d.specialization)).size}
              </p>
            </div>
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 hover:scale-105">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-green-400" />
                <span className="text-sm text-gray-300">Active Today</span>
              </div>
              <p className="text-2xl font-bold text-green-400 mt-1">{doctors.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-gradient-to-br from-black to-black backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
        <div className="relative">
          <Search className="h-5 w-5 absolute left-4 top-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search doctors by name, specialization, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-black/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
          />
        </div>
      </div>

      {/* Doctor Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-black to-gray-900 backdrop-blur-xl rounded-3xl border border-gray-700/50 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingDoctor(null);
                  setFormData({ name: '', specialization: '', email: '', phone: '', experience: '', qualification: '' });
                }}
                className="text-gray-400 hover:text-white transition-colors duration-200 p-2 hover:bg-gray-800/50 rounded-lg"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter doctor's full name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Specialization *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Cardiology, Neurology"
                    value={formData.specialization}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    placeholder="Years of experience"
                    min="0"
                    max="50"
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Qualification
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., MBBS, MD, MS"
                    value={formData.qualification}
                    onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                  />
                </div>
              </div>
              
              <div className="flex gap-4 pt-6">
                <button 
                  type="submit" 
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-white-500 to-emerald-600 text-white font-medium rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingDoctor ? 'Update' : 'Add'} Doctor</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingDoctor(null);
                    setFormData({ name: '', specialization: '', email: '', phone: '', experience: '', qualification: '' });
                  }}
                  className="px-6 py-3 bg-gray-700/50 text-gray-300 font-medium rounded-xl border border-gray-600/50 transition-all duration-300 hover:bg-gray-600/50 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doctor, idx) => (
            <div
              key={doctor.id}
              className="group relative bg-gradient-to-br from-black to-black backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6 hover:border-gray-600/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/10"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${getSpecializationColor(doctor.specialization)} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`}></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${getSpecializationColor(doctor.specialization)} rounded-xl flex items-center justify-center shadow-lg`}>
                      <Stethoscope className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{doctor.name}</h3>
                      <p className="text-sm text-gray-400">ID: {doctor.id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEdit(doctor)}
                    className="text-gray-400 hover:text-white p-2 hover:bg-gray-800/50 rounded-lg transition-all duration-200"
                    title="Edit Doctor"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Settings className="h-4 w-4 mr-3 text-gray-400" />
                    <span className={`text-sm font-medium px-3 py-1 rounded-full bg-gradient-to-r ${getSpecializationColor(doctor.specialization)} text-white`}>
                      {doctor.specialization}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-300">
                    <Mail className="h-4 w-4 mr-3 text-gray-400" />
                    <span>{doctor.email}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-300">
                    <Phone className="h-4 w-4 mr-3 text-gray-400" />
                    <span>{doctor.phone}</span>
                  </div>
                  
                  {doctor.experience && (
                    <div className="flex items-center text-sm text-gray-300">
                      <Clock className="h-4 w-4 mr-3 text-gray-400" />
                      <span>{doctor.experience} years experience</span>
                    </div>
                  )}
                  
                  {doctor.qualification && (
                    <div className="flex items-center text-sm text-gray-300">
                      <Award className="h-4 w-4 mr-3 text-gray-400" />
                      <span>{doctor.qualification}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-700/50 flex items-center text-xs text-gray-500">
                  <Calendar className="h-3 w-3 mr-2" />
                  <span>Registered: {doctor.createdAt ? new Date(doctor.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <div className="bg-gradient-to-br from-black to-black backdrop-blur-xl rounded-2xl border border-gray-700/50 p-12 text-center">
              <Stethoscope className="h-16 w-16 mx-auto text-gray-600 mb-6" />
              <h3 className="text-xl font-bold text-white mb-2">No doctors found</h3>
              <p className="text-gray-400 mb-8">
                {searchTerm ? 'No doctors match your search criteria.' : 'Get started by adding your first doctor to the system.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-black  to-emerald-600 border border-emerald-500 text-white font-medium rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25 mx-auto"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add First Doctor</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};