import React, { useState, useEffect } from 'react';
import { Save, X, User, Mail, Calendar, CreditCard, Phone, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Teacher } from '../types';
import { teachersApi } from '../services/api';
import { useApp } from '../context/AppContext';

interface TeacherFormProps {
  teacher: Teacher | null;
  onSave: (teacher: Teacher) => void;
  onCancel: () => void;
}

const TeacherForm: React.FC<TeacherFormProps> = ({ teacher, onSave, onCancel }) => {
  const { dispatch } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dateOfBirth: '',
    dateOfJoining: '',
    fatherName: '',
    verificationCardType: '' as 'aadhar' | 'pan' | '',
    verificationCardNumber: '',
    mobileNumber: '',
    emergencyNumber: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (teacher) {
      setFormData({
        name: teacher.name,
        email: teacher.email,
        dateOfBirth: teacher.dateOfBirth,
        dateOfJoining: teacher.dateOfJoining,
        fatherName: teacher.fatherName,
        verificationCardType: teacher.verificationCard.type,
        verificationCardNumber: teacher.verificationCard.number,
        mobileNumber: teacher.mobileNumber,
        emergencyNumber: teacher.emergencyNumber,
      });
    } else {
      // Set default joining date to today
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, dateOfJoining: today }));
    }
  }, [teacher]);

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.name.trim()) newErrors.name = 'Teacher name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.dateOfJoining) newErrors.dateOfJoining = 'Date of joining is required';
    if (!formData.fatherName.trim()) newErrors.fatherName = 'Father\'s name is required';
    if (!formData.verificationCardType) newErrors.verificationCardType = 'Verification card type is required';
    if (!formData.verificationCardNumber.trim()) newErrors.verificationCardNumber = 'Verification card number is required';
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';
    if (!formData.emergencyNumber.trim()) newErrors.emergencyNumber = 'Emergency number is required';

    // Age validation
    const age = calculateAge(formData.dateOfBirth);
    if (age < 18 || age > 65) {
      newErrors.dateOfBirth = 'Teacher age should be between 18 and 65 years';
    }

    // Date validation
    if (formData.dateOfBirth && formData.dateOfJoining) {
      const birthDate = new Date(formData.dateOfBirth);
      const joiningDate = new Date(formData.dateOfJoining);
      if (joiningDate <= birthDate) {
        newErrors.dateOfJoining = 'Joining date must be after birth date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const age = calculateAge(formData.dateOfBirth);
      
      const teacherData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        dateOfBirth: formData.dateOfBirth,
        dateOfJoining: formData.dateOfJoining,
        fatherName: formData.fatherName.trim(),
        age,
        verificationCard: {
          type: formData.verificationCardType,
          number: formData.verificationCardNumber.trim()
        },
        mobileNumber: formData.mobileNumber.trim(),
        emergencyNumber: formData.emergencyNumber.trim(),
      };

      let savedTeacher: Teacher;

      if (teacher) {
        const response = await teachersApi.update(teacher.id, teacherData);
        savedTeacher = response.data;
        dispatch({ type: 'UPDATE_TEACHER', payload: savedTeacher });
      } else {
        const response = await teachersApi.create(teacherData);
        savedTeacher = response.data;
        dispatch({ type: 'ADD_TEACHER', payload: savedTeacher });
      }

      onSave(savedTeacher);
    } catch (error) {
      console.error('Error saving teacher:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save teacher. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear related errors
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const currentAge = calculateAge(formData.dateOfBirth);

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
              <h1 className="text-2xl font-bold text-gray-900">
                {teacher ? 'Edit Teacher' : 'Teacher Registration'}
              </h1>
              <p className="text-gray-600">Add teacher information and details</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter teacher's full name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth *
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {currentAge > 0 && (
                <p className="text-sm text-gray-600 mt-1">Age: {currentAge} years</p>
              )}
              {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
            </div>

            <div>
              <label htmlFor="dateOfJoining" className="block text-sm font-medium text-gray-700 mb-2">
                Date of Joining *
              </label>
              <input
                type="date"
                id="dateOfJoining"
                name="dateOfJoining"
                value={formData.dateOfJoining}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.dateOfJoining ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.dateOfJoining && <p className="text-red-500 text-sm mt-1">{errors.dateOfJoining}</p>}
            </div>

            <div>
              <label htmlFor="fatherName" className="block text-sm font-medium text-gray-700 mb-2">
                Father's Name *
              </label>
              <input
                type="text"
                id="fatherName"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.fatherName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter father's name"
              />
              {errors.fatherName && <p className="text-red-500 text-sm mt-1">{errors.fatherName}</p>}
            </div>
          </div>
        </div>

        {/* Verification Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Verification Card</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="verificationCardType" className="block text-sm font-medium text-gray-700 mb-2">
                Card Type *
              </label>
              <select
                id="verificationCardType"
                name="verificationCardType"
                value={formData.verificationCardType}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.verificationCardType ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select card type</option>
                <option value="aadhar">Aadhar Card</option>
                <option value="pan">PAN Card</option>
              </select>
              {errors.verificationCardType && <p className="text-red-500 text-sm mt-1">{errors.verificationCardType}</p>}
            </div>

            <div>
              <label htmlFor="verificationCardNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Card Number *
              </label>
              <input
                type="text"
                id="verificationCardNumber"
                name="verificationCardNumber"
                value={formData.verificationCardNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.verificationCardNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter card number"
              />
              {errors.verificationCardNumber && <p className="text-red-500 text-sm mt-1">{errors.verificationCardNumber}</p>}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number *
              </label>
              <input
                type="tel"
                id="mobileNumber"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.mobileNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter mobile number"
              />
              {errors.mobileNumber && <p className="text-red-500 text-sm mt-1">{errors.mobileNumber}</p>}
            </div>

            <div>
              <label htmlFor="emergencyNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Contact Number *
              </label>
              <input
                type="tel"
                id="emergencyNumber"
                name="emergencyNumber"
                value={formData.emergencyNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.emergencyNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter emergency contact number"
              />
              {errors.emergencyNumber && <p className="text-red-500 text-sm mt-1">{errors.emergencyNumber}</p>}
            </div>
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
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Saving...' : (teacher ? 'Update Teacher' : 'Register Teacher')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TeacherForm;