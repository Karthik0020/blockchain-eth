import { api } from "../libs/api";
import { Alert } from "./Alert";
import { LoadingSpinner } from "./LoadingSpinner";
import { 
  Users, 
  Plus, 
  Edit, 
  Save,
  X,
  Search,
  Phone,
  Mail,
  MapPin,
  User,
  Activity,
  TrendingUp,
  UserPlus,
  Heart,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

export const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '', age: '', gender: '', email: '', phone: '', address: ''
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await api.get('/patients');
      setPatients(data);
      setError(null);
    } catch (error) {
      setError('Failed to load patients');
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPatient) {
        await api.put(`/patients/${editingPatient.id}`, formData);
      } else {
        await api.post('/patients', formData);
      }
      setFormData({ name: '', age: '', gender: '', email: '', phone: '', address: '' });
      setShowForm(false);
      setEditingPatient(null);
      fetchPatients();
    } catch (error) {
      setError('Failed to save patient');
      console.error('Error saving patient:', error);
    }
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      email: patient.email,
      phone: patient.phone,
      address: patient.address
    });
    setShowForm(true);
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  if (loading) return <LoadingSpinner message="Loading patients..." />;

  return (
    <div className="space-y-8 animate-fadeIn">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-black to-black backdrop-blur-xl rounded-3xl border border-white p-8 hover:border-gray-600/50 transition-all duration-500 hover:scale-102 hover:shadow-2xl hover:shadow-purple-500/10">
        <div className="absolute inset-0 bg-gradient-to-r from-black to-black border-white"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-black to-blue-800 rounded-2xl flex items-center border border-blue-500 justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-400 to-blue-950 bg-clip-text text-transparent">
                  Patient Registry
                </h1>
                <p className="text-gray-300 text-lg">
                  Comprehensive patient management and care coordination
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-black to-blue-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-2 border border-blue-500"
            >
              <Plus className="h-5 w-5" />
              Add Patient
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-black backdrop-blur-sm rounded-xl p-4 border border-gray-300 hover:border-gray-600/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-200" />
                <span className="text-sm text-gray-300">Total Patients</span>
              </div>
              <p className="text-2xl font-bold text-blue-200 mt-1">{patients.length}</p>
            </div>
            <div className="bg-black backdrop-blur-sm rounded-xl p-4 border border-gray-300 hover:border-gray-600/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/10">
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-green-200" />
                <span className="text-sm text-gray-300">Active Cases</span>
              </div>
              <p className="text-2xl font-bold text-green-200 mt-1">{Math.floor(patients.length * 0.7)}</p>
            </div>
            <div className="bg-black backdrop-blur-sm rounded-xl p-4 border border-gray-300 hover:border-gray-600/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10">
              <div className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5 text-purple-200" />
                <span className="text-sm text-gray-300">New This Month</span>
              </div>
              <p className="text-2xl font-bold text-purple-200 mt-1">{Math.floor(patients.length * 0.2)}</p>
            </div>
            <div className="bg-black backdrop-blur-sm rounded-xl p-4 border border-gray-300 hover:border-gray-600/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/10">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-yellow-200" />
                <span className="text-sm text-gray-300">Growth Rate</span>
              </div>
              <p className="text-2xl font-bold text-yellow-200 mt-1">+12%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-gradient-to-br from-black to-black backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="h-5 w-5 absolute left-4 top-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* Patient Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-black to-gray-900 backdrop-blur-xl rounded-3xl border border-gray-600 p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  {editingPatient ? <Edit className="h-6 w-6 text-white" /> : <UserPlus className="h-6 w-6 text-white" />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {editingPatient ? 'Edit Patient Record' : 'Add New Patient'}
                  </h2>
                  <p className="text-gray-400">
                    {editingPatient ? 'Update patient information' : 'Create a comprehensive patient profile'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingPatient(null);
                  setFormData({ name: '', age: '', gender: '', email: '', phone: '', address: '' });
                }}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter patient's full name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Age *
                      </label>
                      <input
                        type="number"
                        placeholder="Age"
                        min="0"
                        max="150"
                        value={formData.age}
                        onChange={(e) => setFormData({...formData, age: e.target.value})}
                        className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Gender *
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
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
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Address *
                </label>
                <textarea
                  placeholder="Enter full address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                  rows="3"
                  required
                />
              </div>
              
              <div className="flex gap-4 pt-6 border-t border-gray-700">
                <button 
                  type="submit" 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-2"
                >
                  <Save className="h-5 w-5" />
                  {editingPatient ? 'Update Patient' : 'Add Patient'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPatient(null);
                    setFormData({ name: '', age: '', gender: '', email: '', phone: '', address: '' });
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patients Table */}
      <div className="bg-gradient-to-br from-black to-black backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden">
        {filteredPatients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-4 px-6 text-gray-300 font-semibold">Patient</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-semibold">Age & Gender</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-semibold">Contact</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-semibold">Address</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-semibold">Registered</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient, idx) => (
                  <tr 
                    key={patient.id} 
                    className="border-b border-gray-800 hover:bg-gray-900/50 transition-all duration-300"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-white text-lg">{patient.name}</div>
                          <div className="text-sm text-gray-400">ID: {patient.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-white font-medium">{patient.age} years</div>
                      <div className="text-gray-400 text-sm">{patient.gender}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center text-white">
                          <Mail className="h-4 w-4 mr-2 text-blue-400" />
                          <span className="text-sm">{patient.email}</span>
                        </div>
                        <div className="flex items-center text-white">
                          <Phone className="h-4 w-4 mr-2 text-green-400" />
                          <span className="text-sm">{patient.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center text-white">
                        <MapPin className="h-4 w-4 mr-2 text-purple-400" />
                        <span className="text-sm truncate max-w-xs">{patient.address}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-400 text-sm">
                      {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleEdit(patient)}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-2 rounded-lg hover:scale-105 transition-all duration-300"
                        title="Edit Patient"
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
            <div className="w-24 h-24 bg-gradient-to-r from-black to-blue-800 border border-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No patients found</h3>
            <p className="text-gray-400 mb-8 text-lg">
              {searchTerm ? 'No patients match your search criteria.' : 'Get started by adding your first patient to the registry.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-black to-blue-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-2 border border-blue-500 mx-auto"
              >
                
                <Plus className="h-5 w-5" />
                Add First Patient
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};