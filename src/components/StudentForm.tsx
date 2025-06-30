import React, { useState, useEffect } from 'react';
import { Save, X, User, Users, Mail, Phone, MapPin, Calendar, CreditCard, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Student } from '../types';
import { studentsApi } from '../services/api';
import { useApp } from '../context/AppContext';

interface StudentFormProps {
  student: Student | null;
  onSave: (student: Student) => void;
  onCancel: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ student, onSave, onCancel }) => {
  const { dispatch } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    dateOfBirth: '',
    admissionDate: '',
    parentName: '',
    parentVerificationCardType: '' as 'aadhar' | 'pan' | '',
    parentVerificationCardNumber: '',
    parentEmail: '',
    fatherMobile: '',
    motherMobile: '',
    fatherPhone: '',
    motherPhone: '',
    emergencyNumber: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [nextRollNumber, setNextRollNumber] = useState('');

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        grade: student.grade,
        dateOfBirth: student.dateOfBirth,
        admissionDate: student.admissionDate,
        parentName: student.parentName || '',
        parentVerificationCardType: student.parentVerificationCard?.type || '',
        parentVerificationCardNumber: student.parentVerificationCard?.number || '',
        parentEmail: student.parentEmail,
        fatherMobile: student.fatherMobile || '',
        motherMobile: student.motherMobile || '',
        fatherPhone: student.fatherPhone || '',
        motherPhone: student.motherPhone || '',
        emergencyNumber: student.emergencyNumber,
      });
    } else {
      fetchNextRollNumber();
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, admissionDate: today }));
    }
  }, [student]);

  const fetchNextRollNumber = async () => {
    try {
      const response = await studentsApi.getNextRollNumber();
      setNextRollNumber(response.data.rollNumber);
    } catch (error) {
      console.error('Error fetching next roll number:', error);
      const currentYear = new Date().getFullYear();
      setNextRollNumber(`${currentYear}001`);
    }
  };

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

  const grades = [
    'Pre-K', 'Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 
    'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Student name is required';
    if (!formData.grade) newErrors.grade = 'Grade is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.admissionDate) newErrors.admissionDate = 'Admission date is required';
    if (!formData.parentEmail.trim()) {
      newErrors.parentEmail = 'Parent email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.parentEmail)) {
      newErrors.parentEmail = 'Please enter a valid email address';
    }
    if (!formData.emergencyNumber.trim()) newErrors.emergencyNumber = 'Emergency number is required';

    const hasPhoneNumber = formData.fatherMobile || formData.motherMobile || formData.fatherPhone || formData.motherPhone;
    if (!hasPhoneNumber) {
      newErrors.phoneNumbers = 'At least one phone number is required';
    }

    if (formData.parentVerificationCardType && !formData.parentVerificationCardNumber.trim()) {
      newErrors.parentVerificationCardNumber = 'Verification card number is required when type is selected';
    }
    if (formData.parentVerificationCardNumber && !formData.parentVerificationCardType) {
      newErrors.parentVerificationCardType = 'Verification card type is required when number is provided';
    }

    const age = calculateAge(formData.dateOfBirth);
    if (age < 2 || age > 18) {
      newErrors.dateOfBirth = 'Student age should be between 2 and 18 years';
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
      
      const studentData = {
        name: formData.name.trim(),
        grade: formData.grade,
        dateOfBirth: formData.dateOfBirth,
        admissionDate: formData.admissionDate,
        age,
        parentName: formData.parentName.trim() || undefined,
        parentVerificationCard: formData.parentVerificationCardType && formData.parentVerificationCardNumber ? {
          type: formData.parentVerificationCardType,
          number: formData.parentVerificationCardNumber.trim()
        } : undefined,
        parentEmail: formData.parentEmail.trim(),
        fatherMobile: formData.fatherMobile.trim() || undefined,
        motherMobile: formData.motherMobile.trim() || undefined,
        fatherPhone: formData.fatherPhone.trim() || undefined,
        motherPhone: formData.motherPhone.trim() || undefined,
        emergencyNumber: formData.emergencyNumber.trim(),
      };

      let savedStudent: Student;

      if (student) {
        const response = await studentsApi.update(student.id, studentData);
        savedStudent = response.data;
        dispatch({ type: 'UPDATE_STUDENT', payload: savedStudent });
      } else {
        const response = await studentsApi.create(studentData);
        savedStudent = response.data;
        dispatch({ type: 'ADD_STUDENT', payload: savedStudent });
      }

      onSave(savedStudent);
    } catch (error) {
      console.error('Error saving student:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save student. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (errors.phoneNumbers && (name.includes('Mobile') || name.includes('Phone'))) {
      setErrors(prev => ({ ...prev, phoneNumbers: '' }));
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
                {student ? 'Edit Student' : 'Student Registration'}
              </h1>
              {!student && nextRollNumber && (
                <p className="text-gray-600">Roll Number: {nextRollNumber}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Student Information</h3>
          
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter student's full name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-2">
                Grade *
              </label>
              <select
                id="grade"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.grade ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select grade</option>
                {grades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
              {errors.grade && <p className="text-red-500 text-sm mt-1">{errors.grade}</p>}
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {currentAge > 0 && (
                <p className="text-sm text-gray-600 mt-1">Age: {currentAge} years</p>
              )}
              {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
            </div>

            <div>
              <label htmlFor="admissionDate" className="block text-sm font-medium text-gray-700 mb-2">
                Date of Admission *
              </label>
              <input
                type="date"
                id="admissionDate"
                name="admissionDate"
                value={formData.admissionDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.admissionDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.admissionDate && <p className="text-red-500 text-sm mt-1">{errors.admissionDate}</p>}
            </div>
          </div>
        </div>

        {/* Parent Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Parent/Guardian Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="parentName" className="block text-sm font-medium text-gray-700 mb-2">
                Parent's Name (Optional)
              </label>
              <input
                type="text"
                id="parentName"
                name="parentName"
                value={formData.parentName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter parent's name"
              />
            </div>

            <div>
              <label htmlFor="parentEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="parentEmail"
                name="parentEmail"
                value={formData.parentEmail}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.parentEmail ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
              />
              {errors.parentEmail && <p className="text-red-500 text-sm mt-1">{errors.parentEmail}</p>}
            </div>
          </div>

          {/* Verification Card */}
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Parent Verification Card (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="parentVerificationCardType" className="block text-sm font-medium text-gray-700 mb-2">
                  Card Type
                </label>
                <select
                  id="parentVerificationCardType"
                  name="parentVerificationCardType"
                  value={formData.parentVerificationCardType}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.parentVerificationCardType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select card type</option>
                  <option value="aadhar">Aadhar Card</option>
                  <option value="pan">PAN Card</option>
                </select>
                {errors.parentVerificationCardType && <p className="text-red-500 text-sm mt-1">{errors.parentVerificationCardType}</p>}
              </div>

              <div>
                <label htmlFor="parentVerificationCardNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  id="parentVerificationCardNumber"
                  name="parentVerificationCardNumber"
                  value={formData.parentVerificationCardNumber}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.parentVerificationCardNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter card number"
                />
                {errors.parentVerificationCardNumber && <p className="text-red-500 text-sm mt-1">{errors.parentVerificationCardNumber}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h3>
          
          {errors.phoneNumbers && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">{errors.phoneNumbers}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Father's Contact</h4>
              <div className="space-y-4">
                <div>
                  <label htmlFor="fatherMobile" className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    id="fatherMobile"
                    name="fatherMobile"
                    value={formData.fatherMobile}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter father's mobile"
                  />
                </div>
                <div>
                  <label htmlFor="fatherPhone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="fatherPhone"
                    name="fatherPhone"
                    value={formData.fatherPhone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter father's phone"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-4">Mother's Contact</h4>
              <div className="space-y-4">
                <div>
                  <label htmlFor="motherMobile" className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    id="motherMobile"
                    name="motherMobile"
                    value={formData.motherMobile}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter mother's mobile"
                  />
                </div>
                <div>
                  <label htmlFor="motherPhone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="motherPhone"
                    name="motherPhone"
                    value={formData.motherPhone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter mother's phone"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="emergencyNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Emergency Contact Number *
            </label>
            <input
              type="tel"
              id="emergencyNumber"
              name="emergencyNumber"
              value={formData.emergencyNumber}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.emergencyNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter emergency contact number"
            />
            {errors.emergencyNumber && <p className="text-red-500 text-sm mt-1">{errors.emergencyNumber}</p>}
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
              {loading ? 'Saving...' : (student ? 'Update Student' : 'Register Student')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;