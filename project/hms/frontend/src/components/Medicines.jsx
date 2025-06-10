import { api } from "../libs/api";
import { Alert } from "./Alert";
import { LoadingSpinner } from "./LoadingSpinner";
import React, { useState, useEffect } from 'react';

import {
  Plus,
  Edit,
  Save,
  X,
  Pill,
  Package,
  AlertTriangle,
  Calendar,
  Beaker,
  Factory,
  ClipboardList, // Added for modal header icon
  DollarSign, // Added for summary card
  Percent, // Added for summary card
  Clock // Added for summary card
} from 'lucide-react';

export const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    manufacturer: '',
    dosage: '',
    form: '',
    category: '',
    quantity: '',
    unitPrice: '',
    expiryDate: '',
    batchNumber: '',
    description: '',
    status: 'available'
  });

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      console.log('Fetching medicines...');
      setLoading(true);
      const data = await api.get('/medicines');
      console.log('Medicines data:', data);
      setMedicines(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      setError('Failed to load medicines');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const medicineData = {
        ...formData,
        quantity: parseInt(formData.quantity) || 0,
        unitPrice: parseFloat(formData.unitPrice) || 0
      };

      if (editingMedicine) {
        await api.put(`/medicines/${editingMedicine.id}`, medicineData);
      } else {
        await api.post('/medicines', medicineData);
      }

      resetForm();
      fetchMedicines();
    } catch (error) {
      setError('Failed to save medicine');
      console.error('Error saving medicine:', error);
    }
  };

  const handleEdit = (medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name || '',
      genericName: medicine.genericName || '',
      manufacturer: medicine.manufacturer || '',
      dosage: medicine.dosage || '',
      form: medicine.form || '',
      category: medicine.category || '',
      quantity: medicine.quantity?.toString() || '',
      unitPrice: medicine.unitPrice?.toString() || '',
      expiryDate: medicine.expiryDate || '',
      batchNumber: medicine.batchNumber || '',
      description: medicine.description || '',
      status: medicine.status || 'available'
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingMedicine(null);
    setFormData({
      name: '',
      genericName: '',
      manufacturer: '',
      dosage: '',
      form: '',
      category: '',
      quantity: '',
      unitPrice: '',
      expiryDate: '',
      batchNumber: '',
      description: '',
      status: 'available'
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

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const isLowStock = (quantity) => {
    return quantity < 10; // Consider low stock if less than 10 units
  };

  const medicineStats = [
    {
      label: "Total Medicines",
      value: medicines.length,
      icon: Pill,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Total Stock Value",
      value: formatCurrency(medicines.reduce((sum, med) => sum + ((med.quantity || 0) * (med.unitPrice || 0)), 0)),
      icon: DollarSign,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      label: "Low Stock Items",
      value: medicines.filter(med => isLowStock(med.quantity)).length,
      icon: AlertTriangle,
      color: "from-amber-500 to-amber-600",
    },
    {
      label: "Expired Items",
      value: medicines.filter(med => isExpired(med.expiryDate)).length,
      icon: Calendar,
      color: "from-red-500 to-red-600",
    },
  ];


  if (loading) return <LoadingSpinner message="Loading medicines..." />;

  return (
    <div className="p-6 fade-in min-h-screen bg-gradient-to-br from-black to-black text-gray-100">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Medicine Inventory Management</h1>
          <p className="text-gray-400">Oversee pharmaceutical stock, track expiry dates, and manage supplies.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex items-center gap-2 py-2 px-4 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105"
        >
          <Plus className="h-4 w-4" />
          Add Medicine
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {medicineStats.map(({ label, value, icon: Icon, color }, idx) => (
          <div
            key={idx}
            className="group relative bg-gradient-to-br from-black to-black rounded-2xl border border-gray-500 p-6 hover:border-blue-500/50 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10 animate-fade-in"
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
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-1">{label}</p>
                <p className="text-3xl font-bold text-white">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Medicine Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-black to-gray-900 backdrop-blur-xl rounded-3xl border border-gray-600 p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  {editingMedicine ? <Edit className="h-6 w-6 text-white" /> : <Pill className="h-6 w-6 text-white" />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {editingMedicine ? 'Edit Medicine Record' : 'Add New Medicine'}
                  </h2>
                  <p className="text-gray-400">
                    {editingMedicine ? 'Update medicine information' : 'Register a new medicine in the inventory'}
                  </p>
                </div>
              </div>
              <button
                onClick={resetForm}
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
                      Medicine Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter medicine brand name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Generic Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter generic/scientific name"
                      value={formData.genericName}
                      onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Manufacturer
                    </label>
                    <input
                      type="text"
                      placeholder="Enter manufacturer name"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Dosage
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 500mg, 10ml"
                      value={formData.dosage}
                      onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Form
                    </label>
                    <select
                      value={formData.form}
                      onChange={(e) => setFormData({ ...formData, form: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="">Select Form</option>
                      <option value="Tablet">Tablet</option>
                      <option value="Capsule">Capsule</option>
                      <option value="Syrup">Syrup</option>
                      <option value="Injection">Injection</option>
                      <option value="Cream">Cream</option>
                      <option value="Ointment">Ointment</option>
                      <option value="Drops">Drops</option>
                      <option value="Inhaler">Inhaler</option>
                      <option value="Patch">Patch</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="">Select Category</option>
                      <option value="Antibiotic">Antibiotic</option>
                      <option value="Analgesic">Analgesic (Pain Relief)</option>
                      <option value="Antiviral">Antiviral</option>
                      <option value="Antihistamine">Antihistamine</option>
                      <option value="Cardiovascular">Cardiovascular</option>
                      <option value="Diabetes">Diabetes</option>
                      <option value="Respiratory">Respiratory</option>
                      <option value="Gastrointestinal">Gastrointestinal</option>
                      <option value="Neurological">Neurological</option>
                      <option value="Vitamin/Supplement">Vitamin/Supplement</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Inventory & Pricing */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-400" />
                  Inventory & Pricing
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Quantity in Stock *
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Unit Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Batch & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Batch Number
                  </label>
                  <input
                    type="text"
                    placeholder="Enter batch number"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="available">Available</option>
                    <option value="out-of-stock">Out of Stock</option>
                    <option value="discontinued">Discontinued</option>
                    <option value="restricted">Restricted</option>
                  </select>
                </div>
              </div>


              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description/Notes
                </label>
                <textarea
                  placeholder="Enter additional notes, usage instructions, or warnings"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                  rows="3"
                />
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-700 justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-2"
                >
                  <Save className="h-5 w-5" />
                  {editingMedicine ? 'Update Medicine' : 'Add Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Medicines Table */}
      <div className="bg-black rounded-2xl shadow-lg border border-gray-600 overflow-hidden animate-fade-in-up">
        {medicines.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table-auto w-full text-left">
              <thead className="bg-black border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-gray-300 text-sm font-semibold uppercase tracking-wider">Medicine</th>
                  <th className="px-6 py-3 text-gray-300 text-sm font-semibold uppercase tracking-wider">Manufacturer</th>
                  <th className="px-6 py-3 text-gray-300 text-sm font-semibold uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-gray-300 text-sm font-semibold uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-gray-300 text-sm font-semibold uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-gray-300 text-sm font-semibold uppercase tracking-wider">Expiry</th>
                  <th className="px-6 py-3 text-gray-300 text-sm font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-gray-300 text-sm font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black">
                {medicines.map((medicine) => (
                  <tr key={medicine.id} className="bg-black hover:bg-gray-800 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-white">
                          {medicine.name}
                        </div>
                        {medicine.genericName && (
                          <div className="text-sm text-gray-500">
                            {medicine.genericName}
                          </div>
                        )}
                        <div className="text-xs text-gray-400">
                          {medicine.dosage} {medicine.form && `• ${medicine.form}`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Factory className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-400">
                          {medicine.manufacturer || 'Not specified'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-400">
                        {medicine.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className={`font-medium ${
                          isLowStock(medicine.quantity) ? 'text-red-500' : 'text-white'
                        }`}>
                          {medicine.quantity || 0}
                        </span>
                        {isLowStock(medicine.quantity) && (
                          <AlertTriangle className="h-4 w-4 text-red-500" title="Low Stock" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-green-500">
                        {formatCurrency(medicine.unitPrice || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center gap-1 text-sm ${
                        isExpired(medicine.expiryDate) ? 'text-red-500' : 'text-gray-400'
                      }`}>
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(medicine.expiryDate)}</span>
                        {isExpired(medicine.expiryDate) && (
                          <AlertTriangle className="h-4 w-4 text-red-500 ml-1" title="Expired" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        medicine.status === 'available' ? 'bg-green-600 text-white' :
                        medicine.status === 'out-of-stock' ? 'bg-red-600 text-white' :
                        medicine.status === 'discontinued' ? 'bg-gray-600 text-white' :
                        'bg-yellow-600 text-white'
                      }`}>
                        {medicine.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(medicine)}
                        className="text-blue-500 hover:text-blue-300 p-2 rounded-full hover:bg-gray-700 transition-colors duration-200"
                        title="Edit Medicine"
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
            <Pill className="h-16 w-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No medicines in inventory</h3>
            <p className="text-gray-400 mb-6">Add your first medicine to get started.</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex items-center gap-2 py-2 px-4 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 mx-auto"
            >
              <Plus className="h-4 w-4" />
              Add First Medicine
            </button>
          </div>
        )}
      </div>
    </div>
  );
};