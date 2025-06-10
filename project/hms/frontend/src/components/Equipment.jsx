import { api } from "../libs/api";
import { Alert } from "./Alert";
import { LoadingSpinner } from "./LoadingSpinner";
import React, { useState, useEffect } from 'react';

import {
  Plus,
  Edit,
  Save,
  X,
  Wrench,
  Monitor,
  AlertTriangle,
  Calendar,
  MapPin,
  Settings,
  DollarSign,
  Package,
  Clock // Added for summary card
} from 'lucide-react';

export const Equipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    manufacturer: '',
    serialNumber: '',
    category: '',
    department: '',
    location: '',
    purchaseDate: '',
    purchasePrice: '',
    warrantyExpiry: '',
    lastMaintenance: '',
    nextMaintenance: '',
    condition: 'excellent',
    status: 'available',
    description: ''
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      console.log('Fetching equipment...');
      setLoading(true);
      const data = await api.get('/equipment');
      console.log('Equipment data:', data);
      setEquipment(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      setError('Failed to load equipment');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const equipmentData = {
        ...formData,
        purchasePrice: parseFloat(formData.purchasePrice) || 0,
      };

      if (editingEquipment) {
        await api.put(`/equipment/${editingEquipment.id}`, equipmentData);
      } else {
        await api.post('/equipment', equipmentData);
      }

      resetForm();
      fetchEquipment();
    } catch (error) {
      setError('Failed to save equipment');
      console.error('Error saving equipment:', error);
    }
  };

  const handleEdit = (item) => {
    setEditingEquipment(item);
    setFormData({
      name: item.name || '',
      model: item.model || '',
      manufacturer: item.manufacturer || '',
      serialNumber: item.serialNumber || '',
      category: item.category || '',
      department: item.department || '',
      location: item.location || '',
      purchaseDate: item.purchaseDate || '',
      purchasePrice: item.purchasePrice?.toString() || '',
      warrantyExpiry: item.warrantyExpiry || '',
      lastMaintenance: item.lastMaintenance || '',
      nextMaintenance: item.nextMaintenance || '',
      condition: item.condition || 'excellent',
      status: item.status || 'available',
      description: item.description || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingEquipment(null);
    setFormData({
      name: '',
      model: '',
      manufacturer: '',
      serialNumber: '',
      category: '',
      department: '',
      location: '',
      purchaseDate: '',
      purchasePrice: '',
      warrantyExpiry: '',
      lastMaintenance: '',
      nextMaintenance: '',
      condition: 'excellent',
      status: 'available',
      description: ''
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const isMaintenanceDue = (dateString) => {
    if (!dateString) return false;
    const maintenanceDate = new Date(dateString);
    const now = new Date();
    // Consider maintenance due if within the next 30 days or overdue
    return maintenanceDate <= new Date(now.setDate(now.getDate() + 30));
  };

  const equipmentStats = [
    {
      label: "Total Equipment",
      value: equipment.length,
      icon: Monitor,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Total Value",
      value: formatCurrency(equipment.reduce((sum, item) => sum + (item.purchasePrice || 0), 0)),
      icon: DollarSign,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      label: "Maintenance Due",
      value: equipment.filter(item => isMaintenanceDue(item.nextMaintenance)).length,
      icon: Wrench,
      color: "from-amber-500 to-amber-600",
    },
    {
      label: "Out of Order",
      value: equipment.filter(item => item.status === 'out-of-order').length,
      icon: AlertTriangle,
      color: "from-red-500 to-red-600",
    },
  ];

  if (loading) return <LoadingSpinner message="Loading equipment..." />;

  return (
    <div className="p-6 fade-in min-h-screen bg-gradient-to-br from-black to-gray-900 text-gray-100">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Hospital Equipment Management</h1>
          <p className="text-gray-400">Manage and track all medical and non-medical equipment.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex items-center gap-2 py-2 px-4 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105"
        >
          <Plus className="h-4 w-4" />
          Add Equipment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {equipmentStats.map(({ label, value, icon: Icon, color }, idx) => (
          <div
            key={idx}
            className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 p-6 hover:border-blue-500/50 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10 animate-fade-in"
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

      {/* Equipment Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-black to-gray-900 backdrop-blur-xl rounded-3xl border border-gray-600 p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  {editingEquipment ? <Edit className="h-6 w-6 text-white" /> : <Monitor className="h-6 w-6 text-white" />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {editingEquipment ? 'Edit Equipment Record' : 'Add New Equipment'}
                  </h2>
                  <p className="text-gray-400">
                    {editingEquipment ? 'Update equipment information' : 'Register a new equipment item'}
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
                      Equipment Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter equipment name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Model
                    </label>
                    <input
                      type="text"
                      placeholder="Enter model number"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
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
                      Serial Number
                    </label>
                    <input
                      type="text"
                      placeholder="Enter serial number"
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
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
                      <option value="Diagnostic">Diagnostic</option>
                      <option value="Surgical">Surgical</option>
                      <option value="Therapeutic">Therapeutic</option>
                      <option value="Laboratory">Laboratory</option>
                      <option value="Patient Care">Patient Care</option>
                      <option value="IT">IT Equipment</option>
                      <option value="Office">Office Equipment</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Radiology, ICU, OR"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Location & Purchase */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-400" />
                  Location & Purchase
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Room 101, Storage"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Purchase Date
                    </label>
                    <input
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Purchase Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Maintenance & Status */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-blue-400" />
                  Maintenance & Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Warranty Expiry
                    </label>
                    <input
                      type="date"
                      value={formData.warrantyExpiry}
                      onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last Maintenance
                    </label>
                    <input
                      type="date"
                      value={formData.lastMaintenance}
                      onChange={(e) => setFormData({ ...formData, lastMaintenance: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Next Maintenance
                    </label>
                    <input
                      type="date"
                      value={formData.nextMaintenance}
                      onChange={(e) => setFormData({ ...formData, nextMaintenance: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Condition
                    </label>
                    <select
                      value={formData.condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                    </select>
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
                      <option value="in-use">In Use</option>
                      <option value="under-maintenance">Under Maintenance</option>
                      <option value="out-of-order">Out of Order</option>
                      <option value="retired">Retired</option>
                    </select>
                  </div>
                </div>
              </div>


              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description/Notes
                </label>
                <textarea
                  placeholder="Enter additional notes about the equipment"
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
                  {editingEquipment ? 'Update Equipment' : 'Add Equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Equipment Table */}
      <div className="bg-gray-900 rounded-2xl shadow-lg border border-gray-700 overflow-hidden animate-fade-in-up">
        {equipment.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table-auto w-full text-left">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-gray-300 text-sm font-semibold uppercase tracking-wider">Equipment</th>
                  <th className="px-6 py-3 text-gray-300 text-sm font-semibold uppercase tracking-wider">Manufacturer</th>
                  <th className="px-6 py-3 text-gray-300 text-sm font-semibold uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-gray-300 text-sm font-semibold uppercase tracking-wider">Next Maintenance</th>
                  <th className="px-6 py-3 text-gray-300 text-sm font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-gray-300 text-sm font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {equipment.map((item) => (
                  <tr key={item.id} className="bg-gray-900 hover:bg-gray-800 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-white">
                          {item.name}
                        </div>
                        {item.model && (
                          <div className="text-sm text-gray-500">
                            {item.model}
                          </div>
                        )}
                        <div className="text-xs text-gray-400">
                          {item.category && `${item.category} • `}{item.department}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-400">
                          {item.manufacturer || 'Not specified'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-400">
                          {item.location || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center gap-1 text-sm ${
                        isMaintenanceDue(item.nextMaintenance) ? 'text-amber-500' : 'text-gray-400'
                      }`}>
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(item.nextMaintenance)}</span>
                        {isMaintenanceDue(item.nextMaintenance) && (
                          <AlertTriangle className="h-4 w-4 text-amber-500 ml-1" title="Maintenance Due Soon" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.status === 'available' ? 'bg-green-600 text-white' :
                        item.status === 'in-use' ? 'bg-blue-600 text-white' :
                        item.status === 'under-maintenance' ? 'bg-yellow-600 text-white' :
                        item.status === 'out-of-order' ? 'bg-red-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-500 hover:text-blue-300 p-2 rounded-full hover:bg-gray-700 transition-colors duration-200"
                        title="Edit Equipment"
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
            <Monitor className="h-16 w-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No equipment found</h3>
            <p className="text-gray-400 mb-6">Add your first equipment item to get started.</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex items-center gap-2 py-2 px-4 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 mx-auto"
            >
              <Plus className="h-4 w-4" />
              Add First Equipment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};