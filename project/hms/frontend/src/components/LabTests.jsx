import { api } from "../libs/api";
import { Alert } from "./Alert";
import { LoadingSpinner } from "./LoadingSpinner";
import React, { useState, useEffect } from 'react';

import { 
  Plus, 
  Edit, 
  Save,
  X,
  TestTube,
  Filter,
  FlaskConical,
  Calendar,
  Clock,
  User,
  FileText,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  PlayCircle,
  XCircle
} from 'lucide-react';

export const LabTests = () => {
  const [labTests, setLabTests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterPatient, setFilterPatient] = useState('');
  const [formData, setFormData] = useState({
    patientId: '', doctorId: '', technicianId: '', testType: '', testName: '', 
    instructions: '', results: '', status: 'ordered', orderedDate: '', completedDate: ''
  });

  useEffect(() => {
    fetchLabTests();
    fetchPatients();
    fetchDoctors();
    fetchTechnicians();
  }, []);

  const fetchLabTests = async () => {
    try {
      console.log('Fetching lab tests...');
      setLoading(true);
      const data = await api.get('/lab-tests');
      console.log('Lab tests data:', data);
      setLabTests(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching lab tests:', error);
      setError('Failed to load lab tests');
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

  const fetchTechnicians = async () => {
    try {
      const data = await api.get('/technicians');
      setTechnicians(data);
    } catch (error) {
      console.error('Error fetching technicians:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        orderedDate: formData.orderedDate || new Date().toISOString().split('T')[0]
      };
      
      if (editingTest) {
        await api.put(`/lab-tests/${editingTest.id}`, submitData);
      } else {
        await api.post('/lab-tests', submitData);
      }
      setFormData({ 
        patientId: '', doctorId: '', technicianId: '', testType: '', testName: '', 
        instructions: '', results: '', status: 'ordered', orderedDate: '', completedDate: ''
      });
      setShowForm(false);
      setEditingTest(null);
      fetchLabTests();
    } catch (error) {
      setError('Failed to save lab test');
      console.error('Error saving lab test:', error);
    }
  };

  const handleEdit = (test) => {
    setEditingTest(test);
    setFormData({
      patientId: test.patientId || '',
      doctorId: test.doctorId || '',
      technicianId: test.technicianId || '',
      testType: test.testType || '',
      testName: test.testName || '',
      instructions: test.instructions || '',
      results: test.results || '',
      status: test.status || 'ordered',
      orderedDate: test.orderedDate?.split('T')[0] || '',
      completedDate: test.completedDate?.split('T')[0] || ''
    });
    setShowForm(true);
  };

  const filteredTests = filterPatient 
    ? labTests.filter(test => test.patientId === filterPatient)
    : labTests;

  // Status configuration
  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle, color: 'text-green-400', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/20' };
      case 'in-progress':
        return { icon: PlayCircle, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/20' };
      case 'ordered':
        return { icon: Clock, color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20' };
      case 'cancelled':
        return { icon: XCircle, color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20' };
      default:
        return { icon: AlertCircle, color: 'text-gray-400', bgColor: 'bg-gray-500/10', borderColor: 'border-gray-500/20' };
    }
  };

  // Quick stats
  const stats = {
    total: labTests.length,
    completed: labTests.filter(t => t.status === 'completed').length,
    inProgress: labTests.filter(t => t.status === 'in-progress').length,
    pending: labTests.filter(t => t.status === 'ordered').length
  };

  if (loading) return <LoadingSpinner message="Loading lab tests..." />;

  return (
    <div className="space-y-8 animate-fadeIn">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-black to-black backdrop-blur-xl rounded-3xl border border-white/20 p-8 hover:border-gray-600/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10">
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-purple-900/20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center border border-purple-500/30">
                <FlaskConical className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
                  Laboratory Tests
                </h1>
                <p className="text-gray-300 text-lg">Manage and track laboratory tests and results</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Filter */}
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-xl p-3 border border-gray-700/50">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filterPatient}
                  onChange={(e) => setFilterPatient(e.target.value)}
                  className="bg-transparent text-white text-sm border-none outline-none"
                >
                  <option value="" className="bg-gray-800">All Patients</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id} className="bg-gray-800">
                      {patient.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Add Test Button */}
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Order Test
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 hover:scale-105">
              <div className="flex items-center space-x-2">
                <TestTube className="h-5 w-5 text-blue-400" />
                <span className="text-sm text-gray-300">Total Tests</span>
              </div>
              <p className="text-2xl font-bold text-blue-400 mt-1">{stats.total}</p>
            </div>
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 hover:scale-105">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-sm text-gray-300">Completed</span>
              </div>
              <p className="text-2xl font-bold text-green-400 mt-1">{stats.completed}</p>
            </div>
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 hover:scale-105">
              <div className="flex items-center space-x-2">
                <PlayCircle className="h-5 w-5 text-yellow-400" />
                <span className="text-sm text-gray-300">In Progress</span>
              </div>
              <p className="text-2xl font-bold text-yellow-400 mt-1">{stats.inProgress}</p>
            </div>
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 hover:scale-105">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-purple-400" />
                <span className="text-sm text-gray-300">Pending</span>
              </div>
              <p className="text-2xl font-bold text-purple-400 mt-1">{stats.pending}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lab Test Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <FlaskConical className="h-6 w-6 text-purple-400" />
                {editingTest ? 'Edit Lab Test' : 'Order New Lab Test'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingTest(null);
                  setFormData({ 
                    patientId: '', doctorId: '', technicianId: '', testType: '', testName: '', 
                    instructions: '', results: '', status: 'ordered', orderedDate: '', completedDate: ''
                  });
                }}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800/50 rounded-lg"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Patient *
                  </label>
                  <select
                    value={formData.patientId}
                    onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
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
                    Ordering Doctor *
                  </label>
                  <select
                    value={formData.doctorId}
                    onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Test Type *
                  </label>
                  <select
                    value={formData.testType}
                    onChange={(e) => setFormData({...formData, testType: e.target.value})}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                    required
                  >
                    <option value="">Select Test Type</option>
                    <option value="Blood Test">Blood Test</option>
                    <option value="Urine Test">Urine Test</option>
                    <option value="Stool Test">Stool Test</option>
                    <option value="Imaging">Imaging</option>
                    <option value="Microbiology">Microbiology</option>
                    <option value="Pathology">Pathology</option>
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Hematology">Hematology</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Test Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Complete Blood Count"
                    value={formData.testName}
                    onChange={(e) => setFormData({...formData, testName: e.target.value})}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Assigned Technician
                </label>
                <select
                  value={formData.technicianId}
                  onChange={(e) => setFormData({...formData, technicianId: e.target.value})}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                >
                  <option value="">Assign Technician</option>
                  {technicians.map((technician) => (
                    <option key={technician.id} value={technician.id}>
                      {technician.name} - {technician.specialization}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Instructions
                </label>
                <textarea
                  placeholder="Special instructions for the test"
                  value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                  rows="3"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ordered Date
                  </label>
                  <input
                    type="date"
                    value={formData.orderedDate}
                    onChange={(e) => setFormData({...formData, orderedDate: e.target.value})}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                  >
                    <option value="ordered">Ordered</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Completed Date
                  </label>
                  <input
                    type="date"
                    value={formData.completedDate}
                    onChange={(e) => setFormData({...formData, completedDate: e.target.value})}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors disabled:opacity-50"
                    disabled={formData.status !== 'completed'}
                  />
                </div>
              </div>
              
              {(editingTest || formData.status === 'completed') && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Results
                  </label>
                  <textarea
                    placeholder="Test results and findings"
                    value={formData.results}
                    onChange={(e) => setFormData({...formData, results: e.target.value})}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                    rows="4"
                  />
                </div>
              )}
              
              <div className="flex gap-4 pt-4 border-t border-gray-700">
                <button 
                  type="submit" 
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {editingTest ? 'Update' : 'Order'} Test
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingTest(null);
                    setFormData({ 
                      patientId: '', doctorId: '', technicianId: '', testType: '', testName: '', 
                      instructions: '', results: '', status: 'ordered', orderedDate: '', completedDate: ''
                    });
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lab Tests Table */}
      <div className="bg-gradient-to-br from-gray-900 to-black backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden">
        {filteredTests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Patient</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Test Details</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Doctor</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Technician</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Dates</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTests.map((test, index) => {
                  const statusConfig = getStatusConfig(test.status);
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <tr 
                      key={test.id} 
                      className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div className="font-medium text-white">
                            {test.patientName}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-white mb-1">
                            {test.testName}
                          </div>
                          <div className="text-sm text-gray-400 flex items-center gap-2">
                            <TestTube className="h-3 w-3" />
                            {test.testType}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-300">
                          {test.doctorName}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-300">
                          {test.technicianName || 'Unassigned'}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-2 text-gray-300">
                            <Calendar className="h-3 w-3" />
                            Ordered: {new Date(test.orderedDate || test.createdAt).toLocaleDateString()}
                          </div>
                          {test.completedDate && (
                            <div className="flex items-center gap-2 text-green-400">
                              <CheckCircle className="h-3 w-3" />
                              Completed: {new Date(test.completedDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.borderColor} border ${statusConfig.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {test.status}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleEdit(test)}
                          className="text-purple-400 hover:text-purple-300 p-2 rounded-lg hover:bg-purple-500/10 transition-all duration-300"
                          title="Edit Test"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center">
              <FlaskConical className="h-12 w-12 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Lab Tests Found</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Get started by ordering your first laboratory test to track patient diagnostics and results.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 flex items-center gap-2 mx-auto"
            >
              <Plus className="h-4 w-4" />
              Order First Lab Test
            </button>
          </div>
        )}
      </div>
    </div>
  );
};