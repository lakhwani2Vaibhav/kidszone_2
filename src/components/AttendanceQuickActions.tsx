import React, { useState } from 'react';
import { Clock, CheckCircle, XCircle, MapPin, MessageSquare, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { attendanceApi } from '../services/api';
import { Teacher } from '../types';

interface AttendanceQuickActionsProps {
  teacher: Teacher;
  onAttendanceUpdate: () => void;
}

const AttendanceQuickActions: React.FC<AttendanceQuickActionsProps> = ({ 
  teacher, 
  onAttendanceUpdate 
}) => {
  const { dispatch } = useApp();
  const [loading, setLoading] = useState<'checkin' | 'checkout' | null>(null);
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [showCheckOutForm, setShowCheckOutForm] = useState(false);
  const [formData, setFormData] = useState({
    location: 'School Campus',
    notes: '',
  });

  // Check if teacher has already checked in today
  const today = new Date().toISOString().split('T')[0];
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [hasCheckedOut, setHasCheckedOut] = useState(false);

  const handleCheckIn = async () => {
    if (showCheckInForm) {
      setLoading('checkin');
      try {
        const response = await attendanceApi.checkIn(teacher.id, {
          location: formData.location.trim() || 'School Campus',
          notes: formData.notes.trim() || undefined,
        });
        
        dispatch({ type: 'ADD_ATTENDANCE', payload: response.data });
        setHasCheckedIn(true);
        setShowCheckInForm(false);
        setFormData({ location: 'School Campus', notes: '' });
        onAttendanceUpdate();
        
        // Show success message
        dispatch({ 
          type: 'SET_ERROR', 
          payload: `✅ ${teacher.name} checked in successfully!` 
        });
        setTimeout(() => dispatch({ type: 'SET_ERROR', payload: null }), 3000);
      } catch (error: any) {
        console.error('Error checking in:', error);
        dispatch({ 
          type: 'SET_ERROR', 
          payload: error.response?.data?.error || 'Failed to check in. Please try again.' 
        });
      } finally {
        setLoading(null);
      }
    } else {
      setShowCheckInForm(true);
    }
  };

  const handleCheckOut = async () => {
    if (showCheckOutForm) {
      setLoading('checkout');
      try {
        const response = await attendanceApi.checkOut(teacher.id, {
          notes: formData.notes.trim() || undefined,
        });
        
        dispatch({ type: 'UPDATE_ATTENDANCE', payload: response.data });
        setHasCheckedOut(true);
        setShowCheckOutForm(false);
        setFormData({ location: 'School Campus', notes: '' });
        onAttendanceUpdate();
        
        // Show success message
        dispatch({ 
          type: 'SET_ERROR', 
          payload: `✅ ${teacher.name} checked out successfully!` 
        });
        setTimeout(() => dispatch({ type: 'SET_ERROR', payload: null }), 3000);
      } catch (error: any) {
        console.error('Error checking out:', error);
        dispatch({ 
          type: 'SET_ERROR', 
          payload: error.response?.data?.error || 'Failed to check out. Please try again.' 
        });
      } finally {
        setLoading(null);
      }
    } else {
      setShowCheckOutForm(true);
    }
  };

  const handleCancel = () => {
    setShowCheckInForm(false);
    setShowCheckOutForm(false);
    setFormData({ location: 'School Campus', notes: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{teacher.name}</h3>
          <p className="text-sm text-gray-500">{teacher.email}</p>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={handleCheckIn}
          disabled={loading === 'checkin' || hasCheckedIn}
          className={`flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
            hasCheckedIn
              ? 'bg-green-100 text-green-800 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          } ${loading === 'checkin' ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading === 'checkin' ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          ) : (
            <CheckCircle className="w-4 h-4 mr-2" />
          )}
          {hasCheckedIn ? 'Checked In' : 'Check In'}
        </button>

        <button
          onClick={handleCheckOut}
          disabled={loading === 'checkout' || !hasCheckedIn || hasCheckedOut}
          className={`flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
            !hasCheckedIn || hasCheckedOut
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : hasCheckedOut
              ? 'bg-red-100 text-red-800 cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-red-700'
          } ${loading === 'checkout' ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading === 'checkout' ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
          ) : (
            <XCircle className="w-4 h-4 mr-2" />
          )}
          {hasCheckedOut ? 'Checked Out' : 'Check Out'}
        </button>
      </div>

      {/* Check In Form */}
      {showCheckInForm && (
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Check In Details</h4>
          <div className="space-y-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter location"
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Add any notes..."
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCheckIn}
                disabled={loading === 'checkin'}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading === 'checkin' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Confirm Check In
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Check Out Form */}
      {showCheckOutForm && (
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Check Out Details</h4>
          <div className="space-y-4">
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Add any notes about your day..."
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCheckOut}
                disabled={loading === 'checkout'}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading === 'checkout' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                Confirm Check Out
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Display */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Today's Status:</span>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-1 ${hasCheckedIn ? 'text-green-600' : 'text-gray-400'}`}>
              <CheckCircle className="w-4 h-4" />
              <span>Check In</span>
            </div>
            <div className={`flex items-center space-x-1 ${hasCheckedOut ? 'text-red-600' : 'text-gray-400'}`}>
              <XCircle className="w-4 h-4" />
              <span>Check Out</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceQuickActions;