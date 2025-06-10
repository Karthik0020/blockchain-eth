import { api } from "../libs/api";
import { Alert } from "./Alert";
import { LoadingSpinner } from "./LoadingSpinner";
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Save, X, BedDouble, Bed, Users, Calendar, Shield, Activity } from 'lucide-react';

export const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    capacity: ''
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await api.get('/rooms');
      setRooms(data);
      setError(null);
    } catch (error) {
      setError('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await api.put(`/rooms/${editingRoom.id}`, formData);
      } else {
        await api.post('/rooms', formData);
      }
      setFormData({ name: '', type: '', capacity: '' });
      setShowForm(false);
      setEditingRoom(null);
      fetchRooms();
    } catch (error) {
      setError('Failed to save room');
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name || '',
      type: room.type || '',
      capacity: room.capacity || ''
    });
    setShowForm(true);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'occupied':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'maintenance':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'icu':
      case 'intensive care':
        return Shield;
      case 'general':
      case 'ward':
        return Bed;
      case 'surgery':
      case 'operation':
        return Activity;
      default:
        return BedDouble;
    }
  };

  if (loading) return <LoadingSpinner message="Loading rooms..." />;

  return (
    <div className="space-y-8 animate-fadeIn">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-black to-black backdrop-blur-xl rounded-3xl border border-white p-8 hover:border-gray-600/50 transition-all duration-500 hover:scale-10 hover:shadow-2xl hover:shadow-blue-500/10">
        <div className="absolute inset-0 bg-gradient-to-r from-black to-black border-white"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-black to-purple-800 rounded-2xl flex items-center border-purple-500 justify-center">
                <BedDouble className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-400 to-purple-950 bg-clip-text text-transparent">
                  Room Management
                </h1>
                <p className="text-gray-300 text-lg">
                  Manage hospital rooms and optimize capacity utilization
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-black to-purple-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center space-x-2 border border-purple-500"
            >
              <Plus className="h-5 w-5" />
              <span>Add Room</span>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-black backdrop-blur-sm rounded-xl p-4 border border-gray-300 hover:border-gray-600/50 transition-all duration-500 hover:scale-105">
              <div className="flex items-center space-x-2">
                <Bed className="h-5 w-5 text-blue-200" />
                <span className="text-sm text-gray-300">Total Rooms</span>
              </div>
              <p className="text-2xl font-bold text-blue-200 mt-1">{rooms.length}</p>
            </div>
            <div className="bg-black backdrop-blur-sm rounded-xl p-4 border border-gray-300 hover:border-gray-600/50 transition-all duration-500 hover:scale-105">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-200" />
                <span className="text-sm text-gray-300">Available</span>
              </div>
              <p className="text-2xl font-bold text-green-200 mt-1">
                {rooms.filter(r => r.status?.toLowerCase() === 'available').length}
              </p>
            </div>
            <div className="bg-black backdrop-blur-sm rounded-xl p-4 border border-gray-300 hover:border-gray-600/50 transition-all duration-500 hover:scale-105">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-red-200" />
                <span className="text-sm text-gray-300">Occupied</span>
              </div>
              <p className="text-2xl font-bold text-red-200 mt-1">
                {rooms.filter(r => r.status?.toLowerCase() === 'occupied').length}
              </p>
            </div>
            <div className="bg-black backdrop-blur-sm rounded-xl p-4 border border-gray-300 hover:border-gray-600/50 transition-all duration-500 hover:scale-105">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-purple-200" />
                <span className="text-sm text-gray-300">Total Capacity</span>
              </div>
              <p className="text-2xl font-bold text-purple-200 mt-1">
                {rooms.reduce((sum, room) => sum + (parseInt(room.capacity) || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-black to-black backdrop-blur-xl rounded-2xl border border-gray-700 p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingRoom ? 'Edit Room' : 'Add New Room'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingRoom(null);
                  setFormData({ name: '', type: '', capacity: '' });
                }}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Room Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
                  placeholder="Enter room name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Type *</label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
                  placeholder="e.g., ICU, General, Surgery"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Capacity *</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full px-4 py-3 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
                  placeholder="Enter capacity"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-black to-purple-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2 border border-purple-500"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingRoom ? 'Update' : 'Add'} Room</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingRoom(null);
                    setFormData({ name: '', type: '', capacity: '' });
                  }}
                  className="px-6 py-3 bg-black border border-gray-600 text-gray-300 rounded-xl font-medium hover:bg-gray-800 hover:border-gray-500 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rooms Grid */}
      <div className="bg-gradient-to-br from-black to-black backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
        {rooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room, idx) => {
              const TypeIcon = getTypeIcon(room.type);
              return (
                <div
                  key={room.id}
                  className="group bg-black backdrop-blur-sm rounded-xl border border-gray-700 p-6 hover:border-gray-600/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <TypeIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{room.name}</h3>
                        <p className="text-gray-400 text-sm">{room.type}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEdit(room)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-300"
                      title="Edit Room"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Capacity</span>
                      <span className="text-white font-semibold">{room.capacity}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Status</span>
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(room.status)}`}>
                        {room.status || 'Unknown'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center space-x-2 text-gray-400 text-xs">
                      <Calendar className="h-3 w-3" />
                      <span>Last updated: {new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl flex items-center justify-center">
              <BedDouble className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">No rooms added yet</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Start building your hospital infrastructure by adding your first room.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-black to-purple-800 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center space-x-3 mx-auto border border-purple-500"
            >
              <Plus className="h-5 w-5" />
              <span>Add Your First Room</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};