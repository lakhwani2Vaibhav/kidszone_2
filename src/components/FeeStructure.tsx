import React, { useState } from 'react';
import { Plus, Edit, Trash2, DollarSign, ArrowLeft, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FeeItem } from '../types';
import { feeItemsApi } from '../services/api';

const FeeStructure: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    type: 'monthly' as 'monthly' | 'annual' | 'one-time',
    grade: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const grades = [
    'All Grades', 'Pre-K', 'Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 
    'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'
  ];

  const handleAddFee = () => {
    setEditingFee(null);
    setFormData({ name: '', amount: '', type: 'monthly', grade: '' });
    setShowForm(true);
  };

  const handleEditFee = (fee: FeeItem) => {
    setEditingFee(fee);
    setFormData({
      name: fee.name,
      amount: fee.amount.toString(),
      type: fee.type,
      grade: fee.grade || '',
    });
    setShowForm(true);
  };

  const handleDeleteFee = async (feeId: string) => {
    if (window.confirm('Are you sure you want to delete this fee item?')) {
      setLoading(true);
      try {
        await feeItemsApi.delete(feeId);
        dispatch({ type: 'DELETE_FEE_ITEM', payload: feeId });
      } catch (error) {
        console.error('Error deleting fee item:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to delete fee item. Please try again.' });
      } finally {
        setLoading(false);
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Fee name is required';
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const feeData = {
        name: formData.name.trim(),
        amount: parseFloat(formData.amount),
        type: formData.type,
        grade: formData.grade || undefined,
      };

      let savedFee: FeeItem;

      if (editingFee) {
        const response = await feeItemsApi.update(editingFee.id, feeData);
        savedFee = response.data;
        dispatch({ type: 'UPDATE_FEE_ITEM', payload: savedFee });
      } else {
        const response = await feeItemsApi.create(feeData);
        savedFee = response.data;
        dispatch({ type: 'ADD_FEE_ITEM', payload: savedFee });
      }

      setShowForm(false);
      setEditingFee(null);
      setFormData({ name: '', amount: '', type: 'monthly', grade: '' });
      setErrors({});
    } catch (error) {
      console.error('Error saving fee item:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save fee item. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingFee(null);
    setFormData({ name: '', amount: '', type: 'monthly', grade: '' });
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'monthly':
        return 'bg-blue-100 text-blue-800';
      case 'annual':
        return 'bg-green-100 text-green-800';
      case 'one-time':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (showForm) {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {editingFee ? 'Edit Fee Item' : 'Add New Fee Item'}
                </h1>
                <p className="text-gray-600">Configure fee structure for the academy</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Fee Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Fee Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Fee Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter fee name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Fee Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual</option>
                  <option value="one-time">One-time</option>
                </select>
              </div>

              <div>
                <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-2">
                  Applicable Grade (Optional)
                </label>
                <select
                  id="grade"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Grades</option>
                  {grades.slice(1).map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {loading ? 'Saving...' : (editingFee ? 'Update Fee' : 'Add Fee')}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Fee Structure</h2>
          <p className="text-gray-600">Manage school fees and charges</p>
        </div>
        <button
          onClick={handleAddFee}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Fee Item
        </button>
      </div>

      {/* Fee Items List */}
      {state.feeItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.feeItems.map((fee) => (
            <div key={fee.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{fee.name}</h3>
                    <p className="text-2xl font-bold text-blue-600">₹{fee.amount.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditFee(fee)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    title="Edit Fee"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteFee(fee.id)}
                    disabled={loading}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                    title="Delete Fee"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Type:</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(fee.type)}`}>
                    {fee.type}
                  </span>
                </div>
                
                {fee.grade && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Grade:</span>
                    <span className="text-sm font-medium text-gray-900">{fee.grade}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No fee items found</h3>
          <p className="text-gray-500 mb-6">Create your first fee item to get started</p>
          <button
            onClick={handleAddFee}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add First Fee Item
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-900 font-medium">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeStructure;