import { api } from "../libs/api";
import { Alert } from "./Alert";
import { LoadingSpinner } from "./LoadingSpinner";
import React, { useState, useEffect } from 'react';

import { 
  Plus, 
  Edit, 
  Save,
  X,
  Receipt,
  DollarSign,
  Calendar,
  User,
  Filter,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const Bills = () => {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterPatientId, setFilterPatientId] = useState('');
  const [formData, setFormData] = useState({
    patientId: '', 
    description: '', 
    amount: '', 
    billType: '', 
    dueDate: '', 
    status: 'pending'
  });

  useEffect(() => {
    fetchBills();
    fetchPatients();
  }, []);

  useEffect(() => {
    fetchBills();
  }, [filterPatientId]);

  const fetchBills = async () => {
    try {
      console.log('Fetching bills...');
      setLoading(true);
      const url = filterPatientId ? `/bills?patientId=${filterPatientId}` : '/bills';
      const data = await api.get(url);
      console.log('Bills data:', data);
      setBills(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching bills:', error);
      setError('Failed to load bills');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const billData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      if (editingBill) {
        await api.put(`/bills/${editingBill.id}`, billData);
      } else {
        await api.post('/bills', billData);
      }
      
      setFormData({ 
        patientId: '', 
        description: '', 
        amount: '', 
        billType: '', 
        dueDate: '', 
        status: 'pending' 
      });
      setShowForm(false);
      setEditingBill(null);
      fetchBills();
    } catch (error) {
      setError('Failed to save bill');
      console.error('Error saving bill:', error);
    }
  };

  const handleEdit = (bill) => {
    setEditingBill(bill);
    setFormData({
      patientId: bill.patientId || '',
      description: bill.description || '',
      amount: bill.amount?.toString() || '',
      billType: bill.billType || '',
      dueDate: bill.dueDate || '',
      status: bill.status || 'pending'
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingBill(null);
    setFormData({ 
      patientId: '', 
      description: '', 
      amount: '', 
      billType: '', 
      dueDate: '', 
      status: 'pending' 
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) return <LoadingSpinner message="Loading bills..." />;

  return (
    <div className="space-y-8 animate-fadeIn">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-black to-black backdrop-blur-xl rounded-3xl border border-gray-700 p-8 hover:border-gray-600/50 transition-all duration-500">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Receipt className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-400 to-purple-600 bg-clip-text text-transparent">
                  Bills Management
                </h1>
                <p className="text-gray-300 text-lg">
                  Manage patient billing and invoices with precision
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <Plus className="h-5 w-5" />
              Create Bill
            </button>
            
          </div>
        </div>
      </div>
{/* Summary Cards */}
      {bills.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="group bg-gradient-to-br from-black to-black backdrop-blur-xl rounded-2xl border border-gray-700 p-6 hover:border-gray-600/50 transition-all duration-500 hover:scale-105">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Receipt className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-400">Total Bills</div>
                <div className="text-2xl font-bold text-white">{bills.length}</div>
              </div>
            </div>
          </div>
          
          <div className="group bg-gradient-to-br from-black to-black backdrop-blur-xl rounded-2xl border border-gray-700 p-6 hover:border-gray-600/50 transition-all duration-500 hover:scale-105">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-400">Total Amount</div>
                <div className="text-2xl font-bold text-green-400">
                  {formatCurrency(bills.reduce((sum, bill) => sum + (bill.amount || 0), 0))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="group bg-gradient-to-br from-black to-black backdrop-blur-xl rounded-2xl border border-gray-700 p-6 hover:border-gray-600/50 transition-all duration-500 hover:scale-105">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-400">Paid Bills</div>
                <div className="text-2xl font-bold text-emerald-400">
                  {bills.filter(bill => bill.status === 'paid').length}
                </div>
              </div>
            </div>
          </div>
          
          <div className="group bg-gradient-to-br from-black to-black backdrop-blur-xl rounded-2xl border border-gray-700 p-6 hover:border-gray-600/50 transition-all duration-500 hover:scale-105">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-400">Pending Bills</div>
                <div className="text-2xl font-bold text-yellow-400">
                  {bills.filter(bill => bill.status === 'pending').length}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    
      {/* Filter Section */}
      <div className="bg-gradient-to-br from-black to-black backdrop-blur-xl rounded-2xl border border-gray-700 p-6 hover:border-gray-600/50 transition-all duration-500">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Filter className="h-5 w-5 text-white" />
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-300">Filter by Patient:</label>
            <select
              value={filterPatientId}
              onChange={(e) => setFilterPatientId(e.target.value)}
              className="bg-black border border-gray-600 text-white px-4 py-2 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 w-48"
            >
              <option value="">All Patients</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>
          {filterPatientId && (
            <button
              onClick={() => setFilterPatientId('')}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors duration-300"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Bill Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-black to-black backdrop-blur-xl rounded-3xl border border-gray-700 p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Receipt className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-400 to-purple-600 bg-clip-text text-transparent">
                  {editingBill ? 'Edit Bill' : 'Create New Bill'}
                </h2>
              </div>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-white transition-colors duration-300 p-2 hover:bg-gray-800 rounded-lg"
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
                    className="w-full bg-black border border-gray-600 text-white px-4 py-3 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                    required
                  >
                    <option value="">Select Patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bill Type
                  </label>
                  <select
                    value={formData.billType}
                    onChange={(e) => setFormData({...formData, billType: e.target.value})}
                    className="w-full bg-black border border-gray-600 text-white px-4 py-3 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                  >
                    <option value="">Select Type</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Laboratory">Laboratory Tests</option>
                    <option value="Radiology">Radiology</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Medication">Medication</option>
                    <option value="Room Charges">Room Charges</option>
                    <option value="Emergency">Emergency Services</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  placeholder="Enter bill description or services provided"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-black border border-gray-600 text-white px-4 py-3 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 resize-none"
                  rows="4"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full bg-black border border-gray-600 text-white px-4 py-3 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full bg-black border border-gray-600 text-white px-4 py-3 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full bg-black border border-gray-600 text-white px-4 py-3 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-4 pt-6">
                <button 
                  type="submit" 
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <Save className="h-5 w-5" />
                  {editingBill ? 'Update' : 'Create'} Bill
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-700 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bills Table */}
      <div className="bg-gradient-to-br from-black to-black backdrop-blur-xl rounded-2xl border border-gray-700 overflow-hidden hover:border-gray-600/50 transition-all duration-500">
        {bills.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/50 border-b border-gray-700">
                <tr>
                  <th className="text-left p-4 text-gray-300 font-medium">Bill ID</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Patient</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Description</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Amount</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Type</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Due Date</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Created</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill, idx) => (
                  <tr 
                    key={bill.id} 
                    className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors duration-300"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <td className="p-4">
                      <div className="font-mono text-sm text-gray-400">
                        #{bill.id?.slice(-8)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium text-white">
                          {bill.patientName || 'Unknown Patient'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-300 max-w-xs truncate">
                        {bill.description}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-green-400" />
                        <span className="font-semibold text-green-400">
                          {formatCurrency(bill.amount)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-300">
                        {bill.billType || 'Not specified'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm text-gray-300">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span>{formatDate(bill.dueDate)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        bill.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                        bill.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        bill.status === 'overdue' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {bill.status === 'paid' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {bill.status === 'overdue' && <AlertCircle className="h-3 w-3 mr-1" />}
                        {bill.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                        {bill.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-400">
                        {formatDate(bill.createdAt)}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleEdit(bill)}
                        className="text-purple-400 hover:text-purple-300 p-2 rounded-lg hover:bg-gray-800 transition-all duration-300"
                        title="Edit Bill"
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
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Receipt className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No bills found</h3>
            <p className="text-gray-400 mb-8">
              {filterPatientId ? 'No bills found for the selected patient.' : 'Create your first bill to get started.'}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Create First Bill
            </button>
          </div>
        )}
      </div>

      </div>
  );
};