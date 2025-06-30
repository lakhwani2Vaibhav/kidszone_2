import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Students from './components/Students';
import Teachers from './components/Teachers';
import Attendance from './components/Attendance';
import Invoices from './components/Invoices';
import FeeStructure from './components/FeeStructure';
import StudentView from './components/StudentView';
import TeacherView from './components/TeacherView';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import { Student, Teacher } from './types';

const AppContent: React.FC = () => {
  const { state: authState } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  const handleNavigateToDetails = (type: 'student' | 'teacher', item: Student | Teacher) => {
    if (type === 'student') {
      setViewingStudent(item as Student);
      setViewingTeacher(null);
      setCurrentPage('student-view');
    } else {
      setViewingTeacher(item as Teacher);
      setViewingStudent(null);
      setCurrentPage('teacher-view');
    }
  };

  const handleBackToList = (type: 'student' | 'teacher') => {
    setViewingStudent(null);
    setViewingTeacher(null);
    setCurrentPage(type === 'student' ? 'students' : 'teachers');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onPageChange={setCurrentPage} />;
      case 'students':
        return <Students />;
      case 'teachers':
        return <Teachers />;
      case 'attendance':
        return <Attendance />;
      case 'invoices':
        return <Invoices />;
      case 'fees':
        return <FeeStructure />;
      case 'student-view':
        return viewingStudent ? (
          <StudentView
            student={viewingStudent}
            onClose={() => handleBackToList('student')}
            onEdit={() => {
              setCurrentPage('students');
            }}
          />
        ) : null;
      case 'teacher-view':
        return viewingTeacher ? (
          <TeacherView
            teacher={viewingTeacher}
            onClose={() => handleBackToList('teacher')}
            onEdit={() => {
              setCurrentPage('teachers');
            }}
          />
        ) : null;
      default:
        return <Dashboard onPageChange={setCurrentPage} />;
    }
  };

  // Show loading screen while checking authentication
  if (authState.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!authState.isAuthenticated) {
    if (showLogin) {
      return <LoginPage onBack={() => setShowLogin(false)} />;
    }
    return <HomePage onLogin={() => setShowLogin(true)} />;
  }

  // Show main application if authenticated
  return (
    <AppProvider>
      <Layout 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        onNavigateToDetails={handleNavigateToDetails}
      >
        {renderCurrentPage()}
      </Layout>
    </AppProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;