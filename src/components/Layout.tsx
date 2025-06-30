import React, { useState } from 'react';
import { 
  Users, 
  FileText, 
  Settings, 
  DollarSign, 
  Menu, 
  X,
  Home,
  Bell,
  Search,
  GraduationCap,
  ChevronDown,
  Clock
} from 'lucide-react';
import GlobalSearch from './GlobalSearch';
import { Student, Teacher } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
  onNavigateToDetails?: (type: 'student' | 'teacher', item: Student | Teacher) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange, onNavigateToDetails }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'teachers', label: 'Teachers', icon: GraduationCap },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'fees', label: 'Fee Structure', icon: DollarSign },
  ];

  const getPageTitle = (page: string) => {
    switch (page) {
      case 'dashboard': return 'Dashboard';
      case 'students': return 'Students';
      case 'teachers': return 'Teachers';
      case 'attendance': return 'Attendance';
      case 'invoices': return 'Invoices';
      case 'fees': return 'Fee Structure';
      case 'student-view': return 'Student Details';
      case 'teacher-view': return 'Teacher Details';
      default: return 'Dashboard';
    }
  };

  const handleSearchNavigation = (type: 'student' | 'teacher', item: Student | Teacher) => {
    if (onNavigateToDetails) {
      onNavigateToDetails(type, item);
    } else {
      // Fallback: navigate to the appropriate page
      onPageChange(type === 'student' ? 'students' : 'teachers');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-all duration-300 ease-in-out border-r border-gray-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:flex-shrink-0
      `}>
        {/* Sidebar Header */}
        <div className="h-16 px-6 border-b border-gray-200 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">KZ</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Kid's Zone Academy</h1>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100 text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center px-3 py-2.5 text-left transition-all duration-200 rounded-lg text-sm font-medium
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30 h-16">
          <div className="flex items-center justify-between h-full px-6">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100 text-gray-500"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {getPageTitle(currentPage)}
                </h1>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Global Search */}
              <div className="hidden md:block">
                <GlobalSearch onNavigate={handleSearchNavigation} />
              </div>

              {/* Notifications */}
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>

              {/* Profile */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;