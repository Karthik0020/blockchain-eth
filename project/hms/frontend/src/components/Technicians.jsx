import { api } from "../libs/api";
import { Alert } from "./Alert";
import { LoadingSpinner } from "./LoadingSpinner";
import React, { useState, useEffect } from 'react';

import { 
  Plus, 
  Edit, 
  Save,
  X,
  UserCheck,
  Phone,
  Mail,
  Users,
  Activity,
  Stethoscope,
  Clock,
  Shield,
  Search,
  Filter
} from 'lucide-react';

export const Technicians = () => {
  const [technicians, setTechnicians] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', specialization: '', department: '', shift: '', status: 'active'
  });

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    try {
      console.log('Fetching technicians...');
      setLoading(true);
      const data = await api.get('/technicians');
      console.log('Technicians data:', data);
      setTechnicians(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching technicians:', error);
      setError('Failed to load technicians');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTechnician) {
        await api.put(`/technicians/${editingTechnician.id}`, formData);
      } else {
        await api.post('/technicians', formData);
      }
      setFormData({ name: '', email: '', phone: '', specialization: '', department: '', shift: '', status: 'active' });
      setShowForm(false);
      setEditingTechnician(null);
      fetchTechnicians();
    } catch (error) {
      setError('Failed to save technician');
      console.error('Error saving technician:', error);
    }
  };

  const handleEdit = (technician) => {
    setEditingTechnician(technician);
    setFormData({
      name: technician.name || '',
      email: technician.email || '',
      phone: technician.phone || '',
      specialization: technician.specialization || '',
      department: technician.department || '',
      shift: technician.shift || '',
      status: technician.status || 'active'
    });
    setShowForm(true);
  };

  const filteredTechnicians = technicians.filter(tech => {
    const matchesSearch = tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tech.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tech.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filterDepartment || tech.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'inactive': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'on-leave': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getShiftColor = (shift) => {
    switch(shift) {
      case 'Morning': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Evening': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'Night': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Rotating': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  if (loading) return <LoadingSpinner message="Loading technicians..." />;

  return (
    <div className="space-y-8 animate-fadeIn">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-black to-black backdrop-blur-xl rounded-3xl border border-white/10 p-8 hover:border-gray-600/50 transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Medical Technicians
              </h1>
              <p className="text-gray-300 text-lg">
                Manage your healthcare support staff and specialists
              </p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-black/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-green-400" />
                <span className="text-sm text-gray-300">Total Technicians</span>
              </div>
              <p className="text-2xl font-bold text-green-400 mt-1">{technicians.length}</p>
            </div>
            <div className="bg-black/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5 text-blue-400" />
                <span className="text-sm text-gray-300">Active</span>
              </div>
              <p className="text-2xl font-bold text-blue-400 mt-1">
                {technicians.filter(t => t.status === 'active').length}
              </p>
            </div>
            <div className="bg-black/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
              <div className="flex items-center space-x-2">
                <Stethoscope className="h-5 w-5 text-purple-400" />
                <span className="text-sm text-gray-300">Departments</span>
              </div>
              <p className="text-2xl font-bold text-purple-400 mt-1">
                {new Set(technicians.map(t => t.department).filter(Boolean)).size}
              </p>
            </div>
            <div className="bg-black/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-400" />
                <span className="text-sm text-gray-300">On Duty</span>
              </div>
              <p className="text-2xl font-bold text-yellow-400 mt-1">
                {technicians.filter(t => t.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="bg-gradient-to-br from-black to-black backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search technicians..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-black/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
              />
            </div>
            
            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="pl-10 pr-8 py-2 bg-black/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300 appearance-none"
              >
                <option value="">All Departments</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Radiology">Radiology</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Surgery">Surgery</option>
                <option value="Emergency">Emergency</option>
                <option value="ICU">ICU</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
          >
            <Plus className="h-4 w-4" />
            Add Technician
          </button>
        </div>
      </div>

      {/* Technician Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-black to-gray-900 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {editingTechnician ? 'Edit Technician' : 'Add New Technician'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingTechnician(null);
                  setFormData({ name: '', email: '', phone: '', specialization: '', department: '', shift: '', status: 'active' });
                }}
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter technician's full name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    placeholder="technician@hospital.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Specialization
                  </label>
                  <select
                    value={formData.specialization}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                  >
                    <option value="">Select Specialization</option>
                    <option value="Lab Technician">Lab Technician</option>
                    <option value="Radiology Technician">Radiology Technician</option>
                    <option value="Pharmacy Technician">Pharmacy Technician</option>
                    <option value="Medical Equipment Technician">Medical Equipment Technician</option>
                    <option value="Operating Room Technician">Operating Room Technician</option>
                    <option value="Emergency Medical Technician">Emergency Medical Technician</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                  >
                    <option value="">Select Department</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Radiology">Radiology</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Emergency">Emergency</option>
                    <option value="ICU">ICU</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Shift
                  </label>
                  <select
                    value={formData.shift}
                    onChange={(e) => setFormData({...formData, shift: e.target.value})}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                  >
                    <option value="">Select Shift</option>
                    <option value="Morning">Morning (6 AM - 2 PM)</option>
                    <option value="Evening">Evening (2 PM - 10 PM)</option>
                    <option value="Night">Night (10 PM - 6 AM)</option>
                    <option value="Rotating">Rotating</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on-leave">On Leave</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-4 pt-6">
                <button 
                  type="submit" 
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
                >
                  <Save className="h-4 w-4" />
                  {editingTechnician ? 'Update' : 'Add'} Technician
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingTechnician(null);
                    setFormData({ name: '', email: '', phone: '', specialization: '', department: '', shift: '', status: 'active' });
                  }}
                  className="px-6 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Technicians Grid */}
      <div className="bg-gradient-to-br from-black to-black backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
        {filteredTechnicians.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTechnicians.map((technician, idx) => (
              <div
                key={technician.id}
                className="group relative bg-black/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 hover:border-gray-600/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <UserCheck className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(technician.status)}`}>
                        {technician.status}
                      </span>
                      <button
                        onClick={() => handleEdit(technician)}
                        className="text-gray-400 hover:text-blue-400 p-1 rounded transition-colors duration-300"
                        title="Edit Technician"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-bold text-white">{technician.name}</h3>
                      <p className="text-sm text-gray-400">{technician.specialization || 'Not specified'}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{technician.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{technician.phone}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {technician.department && (
                        <span className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded-lg text-xs">
                          {technician.department}
                        </span>
                      )}
                      {technician.shift && (
                        <span className={`px-2 py-1 rounded-lg text-xs border ${getShiftColor(technician.shift)}`}>
                          {technician.shift}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserCheck className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No technicians found</h3>
            <p className="text-gray-400 mb-8">
              {searchTerm || filterDepartment ? 'Try adjusting your search or filter criteria.' : 'Add your first technician to get started.'}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
            >
              Add First Technician
            </button>
          </div>
        )}
      </div>
    </div>
  );
};