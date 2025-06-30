import React, { useState } from 'react';
import { X, User, Mail, Phone, Calendar, CreditCard, AlertTriangle, ArrowLeft, Edit, GraduationCap, Car as IdCard } from 'lucide-react';
import { Teacher } from '../types';
import TeacherIDCard from './TeacherIDCard';

interface TeacherViewProps {
  teacher: Teacher;
  onClose: () => void;
  onEdit: () => void;
}

const TeacherView: React.FC<TeacherViewProps> = ({ teacher, onClose, onEdit }) => {
  const [showIDCard, setShowIDCard] = useState(false);

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
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{teacher.name}</h1>
                  <p className="text-gray-600">Teacher Details</p>
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
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Teacher
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-gray-900 font-medium">{teacher.name}</p>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Email Address</label>
                <p className="text-gray-900 font-medium">{teacher.email}</p>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Father's Name</label>
                <p className="text-gray-900 font-medium">{teacher.fatherName}</p>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                <p className="text-gray-900 font-medium">
                  {new Date(teacher.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Age</label>
                <p className="text-gray-900 font-medium">{teacher.age} years</p>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Date of Joining</label>
                <p className="text-gray-900 font-medium">
                  {new Date(teacher.dateOfJoining).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Verification Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Verification Card</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Card Type</label>
                <p className="text-gray-900 font-medium capitalize">
                  {teacher.verificationCard.type === 'aadhar' ? 'Aadhar Card' : 'PAN Card'}
                </p>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Card Number</label>
                <p className="text-gray-900 font-medium">{teacher.verificationCard.number}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Phone className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Mobile Number</label>
                <p className="text-gray-900 font-medium">{teacher.mobileNumber}</p>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Emergency Contact</label>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <p className="text-gray-900 font-medium">{teacher.emergencyNumber}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <GraduationCap className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Professional Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Years of Service</label>
                <p className="text-gray-900 font-medium">
                  {Math.floor((new Date().getTime() - new Date(teacher.dateOfJoining).getTime()) / (1000 * 60 * 60 * 24 * 365))} years
                </p>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Employment Status</label>
                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ID Card Modal */}
      {showIDCard && (
        <TeacherIDCard
          teacher={teacher}
          onClose={() => setShowIDCard(false)}
        />
      )}
    </>
  );
};

export default TeacherView;