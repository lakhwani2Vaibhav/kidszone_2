import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, MapPin, MessageSquare, User, Timer } from 'lucide-react';
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
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [formData, setFormData] = useState({
    location: 'School Campus',
    notes: '',
  });

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    checkTodayAttendance();
  }, [teacher.id]);

  const checkTodayAttendance = async () => {
    try {
      const response = await attendanceApi.getByDate(today);
      const teacherAttendance = response.data.find(att => att.teacherId === teacher.id);
      setTodayAttendance(teacherAttendance || null);
    } catch (error) {
      console.error('Error checking today attendance:', error);
    }
  };

  const handleCheckIn = async () => {
    if (showCheckInForm) {
      setLoading('checkin');
      try {
        const response = await attendanceApi.checkIn(teacher.id, {
          location: formData.location.trim() || 'School Campus',
          notes: formData.notes.trim() || undefined,
        });
        
        setTodayAttendance(response.data);
        setShowCheckInForm(false);
        setFormData({ location: 'School Campus', notes: '' });
        onAttendanceUpdate();
        
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
        
        setTodayAttendance(response.data);
        setShowCheckOutForm(false);
        setFormData({ location: 'School Campus', notes: '' });
        onAttendanceUpdate();
        
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

  const hasCheckedIn = todayAttendance && todayAttendance.checkInTime;
  const hasCheckedOut = todayAttendance && todayAttendance.checkOutTime;
  const canCheckOut = hasCheckedIn && !hasCheckedOut;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Teacher Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{teacher.name}</h3>
          <p className="text-sm text-gray-500">{teacher.email}</p>
        </div>
      </div>

      {/* Today's Status */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Today's Status</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${hasCheckedIn ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm text-gray-600">Check In</span>
            {hasCheckedIn && (
              <span className="text-xs font-medium text-green-600">
                {todayAttendance.checkInTime}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${hasCheckedOut ? 'bg-red-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm text-gray-600">Check Out</span>
            {hasCheckedOut && (
              <span className="text-xs font-medium text-red-600">
                {todayAttendance.checkOutTime}
              </span>
            )}
          </div>
        </div>
        
        {todayAttendance && todayAttendance.workingHours > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <Timer className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-900">
                Working Hours: {todayAttendance.workingHours}h
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={handleCheckIn}
          disabled={loading === 'checkin' || hasCheckedIn}
          className={`flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
            hasCheckedIn
              ? 'bg-green-100 text-green-800 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5'
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
          disabled={loading === 'checkout' || !canCheckOut}
          className={`flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
            !canCheckOut
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : hasCheckedOut
              ? 'bg-red-100 text-red-800 cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg transform hover:-translate-y-0.5'
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
      {showCheckInForm && !hasCheckedIn && (
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
      {showCheckOutForm && canCheckOut && (
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

      {/* Completion Message */}
      {hasCheckedIn && hasCheckedOut && (
        <div className="border-t border-gray-200 pt-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">
                Attendance completed for today
              </span>
            </div>
            <p className="text-xs text-green-700 mt-1">
              Working hours: {todayAttendance.workingHours}h
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceQuickActions;