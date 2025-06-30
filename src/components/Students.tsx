import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Mail, Phone, Users, User, GraduationCap, MoreVertical, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import { studentsApi } from '../services/api';
import StudentForm from './StudentForm';
import StudentView from './StudentView';

const Students: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredStudents = state.students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.grade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStudent = () => {
    setEditingStudent(null);
    setShowForm(true);
  };

  const handleViewStudent = (student: Student) => {
    setViewingStudent(student);
    setShowView(true);
  };

  const handleEditStudent = (student: Student, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent card click when edit button is clicked
    }
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleDeleteStudent = async (studentId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent card click when delete button is clicked
    }
    if (window.confirm('Are you sure you want to delete this student? This will also delete all associated invoices.')) {
      setLoading(true);
      try {
        await studentsApi.delete(studentId);
        dispatch({ type: 'DELETE_STUDENT', payload: studentId });
      } catch (error) {
        console.error('Error deleting student:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to delete student. Please try again.' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveStudent = (student: Student) => {
    setShowForm(false);
    setEditingStudent(null);
  };

  if (showForm) {
    return (
      <StudentForm
        student={editingStudent}
        onSave={handleSaveStudent}
        onCancel={() => {
          setShowForm(false);
          setEditingStudent(null);
        }}
      />
    );
  }

  if (showView && viewingStudent) {
    return (
      <StudentView
        student={viewingStudent}
        onClose={() => {
          setShowView(false);
          setViewingStudent(null);
        }}
        onEdit={() => {
          setShowView(false);
          setEditingStudent(viewingStudent);
          setViewingStudent(null);
          setShowForm(true);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Management</h2>
          <p className="text-gray-600 mt-1">View and manage student information</p>
        </div>
        <button
          onClick={handleAddStudent}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search students by name or roll number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Students Section */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Students</h3>
          <p className="text-sm text-gray-500 mt-1">Click on any student card to view details</p>
        </div>

        {filteredStudents.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <div 
                key={student.id} 
                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleViewStudent(student)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{student.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span>Roll No: {student.rollNumber}</span>
                        <span>Class: {student.grade}</span>
                        <span>Age: {student.age} years</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => handleEditStudent(student, e)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit Student"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteStudent(student.id, e)}
                      disabled={loading}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete Student"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'Try adjusting your search terms to find the student you\'re looking for.' : 'Get started by adding your first student to KID\'S ZONE ACADEMY.'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleAddStudent}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Student
              </button>
            )}
          </div>
        )}
      </div>

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

export default Students;