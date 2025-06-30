import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Plus,
  Filter,
  Download,
  Search,
  MapPin,
  Timer,
  BarChart3
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Attendance as AttendanceType, AttendanceStats, Teacher } from '../types';
import AttendanceForm from './AttendanceForm';
import AttendanceStatsComponent from './AttendanceStats';

const Attendance: React.FC = () => {
  const { state } = useApp();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'daily' | 'monthly' | 'stats'>('daily');
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration - in real app, this would come from API
  useEffect(() => {
    // Generate mock attendance data
    const mockAttendance: AttendanceType[] = [];
    const today = new Date();
    
    // Generate data for last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      state.teachers.forEach((teacher, index) => {
        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) return;
        
        // Random attendance pattern
        const random = Math.random();
        let status: 'present' | 'absent' | 'late' | 'half-day';
        let checkInTime = '';
        let checkOutTime = '';
        let workingHours = 0;
        
        if (random > 0.9) {
          status = 'absent';
        } else if (random > 0.8) {
          status = 'late';
          checkInTime = '09:30:00';
          checkOutTime = '17:30:00';
          workingHours = 8;
        } else if (random > 0.95) {
          status = 'half-day';
          checkInTime = '09:00:00';
          checkOutTime = '13:00:00';
          workingHours = 4;
        } else {
          status = 'present';
          checkInTime = '09:00:00';
          checkOutTime = '17:30:00';
          workingHours = 8.5;
        }
        
        if (status !== 'absent') {
          mockAttendance.push({
            id: `${teacher.id}-${dateStr}`,
            teacherId: teacher.id,
            teacher,
            date: dateStr,
            checkInTime,
            checkOutTime,
            status,
            workingHours,
            notes: status === 'late' ? 'Traffic delay' : '',
            location: 'School Campus',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      });
    }
    
    setAttendanceRecords(mockAttendance);
  }, [state.teachers]);

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesDate = viewMode === 'daily' ? record.date === selectedDate : true;
    const matchesTeacher = selectedTeacher === 'all' || record.teacherId === selectedTeacher;
    const matchesSearch = record.teacher.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesDate && matchesTeacher && matchesSearch;
  });

  const todayRecords = attendanceRecords.filter(record => record.date === new Date().toISOString().split('T')[0]);
  
  const stats = {
    totalTeachers: state.teachers.length,
    presentToday: todayRecords.filter(r => r.status === 'present').length,
    lateToday: todayRecords.filter(r => r.status === 'late').length,
    absentToday: state.teachers.length - todayRecords.length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'half-day':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'late':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'absent':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'half-day':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleMarkAttendance = () => {
    setShowForm(true);
  };

  const handleSaveAttendance = (attendance: Omit<AttendanceType, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAttendance: AttendanceType = {
      ...attendance,
      id: `${attendance.teacherId}-${attendance.date}-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setAttendanceRecords(prev => [...prev, newAttendance]);
    setShowForm(false);
  };

  const exportAttendance = () => {
    // In a real app, this would generate and download a CSV/Excel file
    alert('Export functionality would be implemented here');
  };

  if (showForm) {
    return (
      <AttendanceForm
        onSave={handleSaveAttendance}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  if (viewMode === 'stats') {
    return (
      <AttendanceStatsComponent
        attendanceRecords={attendanceRecords}
        onBack={() => setViewMode('daily')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Teacher Attendance</h2>
          <p className="text-gray-600">Track and manage teacher attendance records</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode('stats')}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            View Stats
          </button>
          <button
            onClick={exportAttendance}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button
            onClick={handleMarkAttendance}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Mark Attendance
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-green-600 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              100%
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Teachers</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalTeachers}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-600 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              {stats.totalTeachers > 0 ? Math.round((stats.presentToday / stats.totalTeachers) * 100) : 0}%
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Present Today</p>
            <p className="text-2xl font-bold text-gray-900">{stats.presentToday}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-yellow-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {stats.lateToday}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Late Today</p>
            <p className="text-2xl font-bold text-gray-900">{stats.lateToday}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-sm font-medium text-red-600 flex items-center">
              <XCircle className="w-4 h-4 mr-1" />
              {stats.absentToday}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Absent Today</p>
            <p className="text-2xl font-bold text-gray-900">{stats.absentToday}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as 'daily' | 'monthly' | 'stats')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="daily">Daily View</option>
                <option value="monthly">Monthly View</option>
              </select>
            </div>

            {viewMode === 'daily' && (
              <div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Teachers</option>
                {state.teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search teachers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full lg:w-64"
            />
          </div>
        </div>
      </div>

      {/* Attendance Records */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Attendance Records - {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
        </div>

        {filteredRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Working Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-semibold">
                            {record.teacher.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {record.teacher.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.teacher.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(record.status)}
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Timer className="w-4 h-4 mr-1 text-gray-400" />
                        {record.checkInTime || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Timer className="w-4 h-4 mr-1 text-gray-400" />
                        {record.checkOutTime || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {record.workingHours ? `${record.workingHours}h` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                        {record.location || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {record.notes || '-'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedTeacher !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'No attendance has been marked for the selected date'
              }
            </p>
            <button
              onClick={handleMarkAttendance}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Mark Attendance
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;