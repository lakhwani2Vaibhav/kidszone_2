import React from 'react';
import { Users, FileText, DollarSign, Calendar, TrendingUp, Award, BookOpen, Star, Plus, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface DashboardProps {
  onPageChange: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onPageChange }) => {
  const { state } = useApp();

  const stats = [
    {
      title: 'Total Students',
      value: state.students.length,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12%',
      changeColor: 'text-green-600',
      onClick: () => onPageChange('students')
    },
    {
      title: 'Total Teachers',
      value: state.teachers.length,
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+5%',
      changeColor: 'text-green-600',
      onClick: () => onPageChange('teachers')
    },
    {
      title: 'Total Invoices',
      value: state.invoices.length,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+8%',
      changeColor: 'text-green-600',
      onClick: () => onPageChange('invoices')
    },
    {
      title: 'Pending Payments',
      value: state.invoices.filter(i => i.status === 'pending').length,
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '-5%',
      changeColor: 'text-red-600',
      onClick: () => onPageChange('invoices')
    },
  ];

  const recentInvoices = state.invoices
    .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
    .slice(0, 5);

  const quickActions = [
    {
      title: 'Add New Student',
      description: 'Register a new student',
      icon: Users,
      color: 'bg-blue-600',
      action: () => onPageChange('students')
    },
    {
      title: 'Add New Teacher',
      description: 'Register a new teacher',
      icon: Award,
      color: 'bg-green-600',
      action: () => onPageChange('teachers')
    },
    {
      title: 'Create Invoice',
      description: 'Generate a new invoice',
      icon: FileText,
      color: 'bg-purple-600',
      action: () => onPageChange('invoices')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back! 👋</h1>
            <p className="text-gray-600 mt-1">Here's what's happening at Kid's Zone Academy today.</p>
          </div>
          <div className="hidden lg:block">
            <img 
              src="/Kid-Zone Logo.png" 
              alt="KID'S ZONE ACADEMY" 
              className="w-16 h-16 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <button
              key={index}
              onClick={stat.onClick}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-200 text-left"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className={`text-sm font-medium ${stat.changeColor} flex items-center`}>
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {stat.change}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            
            <div className="space-y-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={action.action}
                    className="w-full p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${action.color} group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{action.title}</h4>
                        <p className="text-sm text-gray-500">{action.description}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3>
              <button 
                onClick={() => onPageChange('invoices')}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                View All
              </button>
            </div>

            {recentInvoices.length > 0 ? (
              <div className="space-y-4">
                {recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{invoice.student.name}</p>
                        <p className="text-sm text-gray-500">#{invoice.invoiceNumber}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₹{invoice.total.toFixed(2)}</p>
                      <span className={`
                        inline-flex px-2 py-1 text-xs font-medium rounded-full
                        ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}
                      `}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h4>
                <p className="text-gray-500 mb-4">Create your first invoice to get started</p>
                <button 
                  onClick={() => onPageChange('invoices')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Invoice
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Getting Started Guide */}
      {state.students.length === 0 && state.teachers.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Let's Get Started! 🚀</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Welcome to your new school management system! Follow these simple steps to set up your academy.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Add Students</h3>
                <p className="text-sm text-gray-600">Register your students with their information</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Add Teachers</h3>
                <p className="text-sm text-gray-600">Register your teaching staff</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Create Invoices</h3>
                <p className="text-sm text-gray-600">Generate and manage invoices</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onPageChange('students')}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Users className="w-5 h-5 mr-2" />
                Add First Student
              </button>
              <button
                onClick={() => onPageChange('teachers')}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Award className="w-5 h-5 mr-2" />
                Add First Teacher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;