import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Mail, Phone, Users, User, GraduationCap, Calendar, Eye } from 'lucide-react';
import { Teacher } from '../types';
import { teachersApi } from '../services/api';
import { useApp } from '../context/AppContext';
import TeacherForm from './TeacherForm';
import TeacherView from './TeacherView';

const Teachers: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredTeachers = state.teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.fatherName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTeacher = () => {
    setEditingTeacher(null);
    setShowForm(true);
  };

  const handleViewTeacher = (teacher: Teacher) => {
    setViewingTeacher(teacher);
    setShowView(true);
  };

  const handleEditTeacher = (teacher: Teacher, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent card click when edit button is clicked
    }
    setEditingTeacher(teacher);
    setShowForm(true);
  };

  const handleDeleteTeacher = async (teacherId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent card click when delete button is clicked
    }
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      setLoading(true);
      try {
        await teachersApi.delete(teacherId);
        dispatch({ type: 'DELETE_TEACHER', payload: teacherId });
      } catch (error) {
        console.error('Error deleting teacher:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to delete teacher. Please try again.' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveTeacher = (teacher: Teacher) => {
    setShowForm(false);
    setEditingTeacher(null);
  };

  if (showForm) {
    return (
      <TeacherForm
        teacher={editingTeacher}
        onSave={handleSaveTeacher}
        onCancel={() => {
          setShowForm(false);
          setEditingTeacher(null);
        }}
      />
    );
  }

  if (showView && viewingTeacher) {
    return (
      <TeacherView
        teacher={viewingTeacher}
        onClose={() => {
          setShowView(false);
          setViewingTeacher(null);
        }}
        onEdit={() => {
          setShowView(false);
          setEditingTeacher(viewingTeacher);
          setViewingTeacher(null);
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
          <h2 className="text-2xl font-bold text-gray-900">Teacher Management</h2>
          <p className="text-gray-600 mt-1">View and manage teacher information</p>
        </div>
        <button
          onClick={handleAddTeacher}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Teacher
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search teachers by name, email, or father's name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          />
        </div>
      </div>

      {/* Teachers Section */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Teachers</h3>
          <p className="text-sm text-gray-500 mt-1">Click on any teacher card to view details</p>
        </div>

        {filteredTeachers.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredTeachers.map((teacher) => (
              <div 
                key={teacher.id} 
                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleViewTeacher(teacher)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{teacher.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span>{teacher.email}</span>
                        <span>Age: {teacher.age} years</span>
                        <span>Mobile: {teacher.mobileNumber}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => handleEditTeacher(teacher, e)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit Teacher"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteTeacher(teacher.id, e)}
                      disabled={loading}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete Teacher"
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
              <GraduationCap className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No teachers found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'Try adjusting your search terms to find the teacher you\'re looking for.' : 'Get started by adding your first teacher to KID\'S ZONE ACADEMY.'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleAddTeacher}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Teacher
              </button>
            )}
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
            <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-900 font-medium">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;