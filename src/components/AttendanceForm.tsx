import React, { useState } from 'react';
import { Save, X, Clock, MapPin, FileText, ArrowLeft, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Attendance, Teacher } from '../types';

interface AttendanceFormProps {
  onSave: (attendance: Omit<Attendance, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const AttendanceForm: React.FC<AttendanceFormProps> = ({ onSave, onCancel }) => {
  const { state } = useApp();
  const [formData, setFormData] = useState({
    teacherId: '',
    date: new Date().toISOString().split('T')[0],
    checkInTime: '',
    checkOutTime: '',
    status: 'present' as 'present' | 'absent' | 'late' | 'half-day',
    notes: '',
    location: 'School Campus',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const selectedTeacher = state.teachers.find(t => t.id === formData.teacherId);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.teacherId) newErrors.teacherId = 'Please select a teacher';
    if (!formData.date) newErrors.date = 'Date is required';
    
    if (formData.status !== 'absent') {
      if (!formData.checkInTime) newErrors.checkInTime = 'Check-in time is required';
      if (formData.status === 'present' && !formData.checkOutTime) {
        newErrors.checkOutTime = 'Check-out time is required for present status';
      }
    }

    // Validate time logic
    if (formData.checkInTime && formData.checkOutTime) {
      const checkIn = new Date(`2000-01-01T${formData.checkInTime}`);
      const checkOut = new Date(`2000-01-01T${formData.checkOutTime}`);
      
      if (checkOut <= checkIn) {
        newErrors.checkOutTime = 'Check-out time must be after check-in time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateWorkingHours = () => {
    if (!formData.checkInTime || !formData.checkOutTime) return 0;
    
    const checkIn = new Date(`2000-01-01T${formData.checkInTime}`);
    const checkOut = new Date(`2000-01-01T${formData.checkOutTime}`);
    
    const diffMs = checkOut.getTime() - checkIn.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return Math.round(diffHours * 100) / 100; // Round to 2 decimal places
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !selectedTeacher) return;

    setLoading(true);
    try {
      const workingHours = calculateWorkingHours();
      
      const attendanceData = {
        teacherId: formData.teacherId,
        teacher: selectedTeacher,
        date: formData.date,
        checkInTime: formData.status === 'absent' ? '' : formData.checkInTime,
        checkOutTime: formData.status === 'absent' ? '' : formData.checkOutTime,
        status: formData.status,
        workingHours: formData.status === 'absent' ? 0 : workingHours,
        notes: formData.notes.trim() || undefined,
        location: formData.location.trim() || undefined,
      };

      onSave(attendanceData);
    } catch (error) {
      console.error('Error saving attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear related errors
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Auto-set status based on check-in time
    if (name === 'checkInTime' && value) {
      const checkInTime = new Date(`2000-01-01T${value}`);
      const standardTime = new Date(`2000-01-01T09:00`); // 9:00 AM
      
      if (checkInTime > standardTime && formData.status === 'present') {
        setFormData(prev => ({ ...prev, status: 'late' }));
      }
    }
  };

  const workingHours = calculateWorkingHours();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
              <p className="text-gray-600">Record teacher attendance for the day</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Attendance Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700 mb-2">
                Select Teacher *
              </label>
              <select
                id="teacherId"
                name="teacherId"
                value={formData.teacherId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.teacherId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Choose a teacher</option>
                {state.teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name} - {teacher.email}
                  </option>
                ))}
              </select>
              {errors.teacherId && <p className="text-red-500 text-sm mt-1">{errors.teacherId}</p>}
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Attendance Status *
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="half-day">Half Day</option>
                <option value="absent">Absent</option>
              </select>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter location"
              />
            </div>
          </div>

          {/* Teacher Info Display */}
          {selectedTeacher && (
            <div className="bg-blue-50 p-4 rounded-lg mt-6">
              <h4 className="font-semibold text-blue-900 mb-2">Teacher Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Name:</strong> {selectedTeacher.name}</p>
                  <p><strong>Email:</strong> {selectedTeacher.email}</p>
                </div>
                <div>
                  <p><strong>Mobile:</strong> {selectedTeacher.mobileNumber}</p>
                  <p><strong>Joining Date:</strong> {new Date(selectedTeacher.dateOfJoining).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Time Information */}
        {formData.status !== 'absent' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Time Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="checkInTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in Time *
                </label>
                <input
                  type="time"
                  id="checkInTime"
                  name="checkInTime"
                  value={formData.checkInTime}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.checkInTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.checkInTime && <p className="text-red-500 text-sm mt-1">{errors.checkInTime}</p>}
              </div>

              <div>
                <label htmlFor="checkOutTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out Time {formData.status === 'present' ? '*' : '(Optional)'}
                </label>
                <input
                  type="time"
                  id="checkOutTime"
                  name="checkOutTime"
                  value={formData.checkOutTime}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.checkOutTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.checkOutTime && <p className="text-red-500 text-sm mt-1">{errors.checkOutTime}</p>}
              </div>
            </div>

            {/* Working Hours Display */}
            {workingHours > 0 && (
              <div className="bg-green-50 p-4 rounded-lg mt-6">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-900">
                    Total Working Hours: {workingHours} hours
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Additional Notes</h3>
          
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any additional notes about the attendance..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
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
              {loading ? 'Saving...' : 'Mark Attendance'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AttendanceForm;