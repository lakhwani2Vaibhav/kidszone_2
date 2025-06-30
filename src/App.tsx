import React, { useState } from 'react';
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
import { Student, Teacher } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);

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
              // Handle edit - you can implement this based on your existing edit flow
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
              // Handle edit - you can implement this based on your existing edit flow
              setCurrentPage('teachers');
            }}
          />
        ) : null;
      default:
        return <Dashboard onPageChange={setCurrentPage} />;
    }
  };

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
}

export default App;