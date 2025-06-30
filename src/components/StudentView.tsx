import React, { useState } from 'react';
import { X, User, Mail, Phone, Calendar, CreditCard, AlertTriangle, ArrowLeft, Edit, Car as IdCard } from 'lucide-react';
import { Student } from '../types';
import StudentIDCard from './StudentIDCard';

interface StudentViewProps {
  student: Student;
  onClose: () => void;
  onEdit: () => void;
}

const StudentView: React.FC<StudentViewProps> = ({ student, onClose, onEdit }) => {
  const [showIDCard, setShowIDCard] = useState(false);

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

  const age = calculateAge(student.dateOfBirth);

  return (
    <>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
                  <p className="text-gray-600">Student Details</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowIDCard(true)}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <IdCard className="w-4 h-4 mr-2" />
                View ID Card
              </button>
              <button
                onClick={onEdit}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Student
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-gray-900 font-medium">{student.name}</p>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Grade</label>
                <p className="text-gray-900 font-medium">{student.grade}</p>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Roll Number</label>
                <p className="text-gray-900 font-medium">{student.rollNumber}</p>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                <p className="text-gray-900 font-medium">
                  {new Date(student.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Age</label>
                <p className="text-gray-900 font-medium">{age} years</p>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Admission Date</label>
                <p className="text-gray-900 font-medium">
                  {new Date(student.admissionDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Parent Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Parent/Guardian Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Parent's Name</label>
                <p className="text-gray-900 font-medium">{student.parentName || 'Not specified'}</p>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Email Address</label>
                <p className="text-gray-900 font-medium">{student.parentEmail}</p>
              </div>
            </div>

            {/* Verification Card */}
            {student.parentVerificationCard && (
              <div className="mt-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                  </div>
                  <h4 className="text-md font-medium text-gray-900">Verification Card</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">Card Type</label>
                    <p className="text-gray-900 font-medium capitalize">
                      {student.parentVerificationCard.type === 'aadhar' ? 'Aadhar Card' : 'PAN Card'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">Card Number</label>
                    <p className="text-gray-900 font-medium">{student.parentVerificationCard.number}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Phone className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Father's Contact */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Father's Contact</h4>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">Mobile Number</label>
                    <p className="text-gray-900 font-medium">{student.fatherMobile || 'Not provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">Phone Number</label>
                    <p className="text-gray-900 font-medium">{student.fatherPhone || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Mother's Contact */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Mother's Contact</h4>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">Mobile Number</label>
                    <p className="text-gray-900 font-medium">{student.motherMobile || 'Not provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">Phone Number</label>
                    <p className="text-gray-900 font-medium">{student.motherPhone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h4 className="text-md font-medium text-gray-900">Emergency Contact</h4>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Emergency Number</label>
                <p className="text-gray-900 font-medium">{student.emergencyNumber}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ID Card Modal */}
      {showIDCard && (
        <StudentIDCard
          student={student}
          onClose={() => setShowIDCard(false)}
        />
      )}
    </>
  );
};

export default StudentView;