import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  TrendingUp, 
  Clock, 
  Users, 
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download
} from 'lucide-react';
import { Attendance, AttendanceStats as AttendanceStatsType, Teacher } from '../types';
import { useApp } from '../context/AppContext';

interface AttendanceStatsProps {
  attendanceRecords: Attendance[];
  onBack: () => void;
}

const AttendanceStats: React.FC<AttendanceStatsProps> = ({ attendanceRecords, onBack }) => {
  const { state } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('all');

  const calculateStats = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (selectedPeriod) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    const filteredRecords = attendanceRecords.filter(record => {
      const recordDate = new Date(record.date);
      const matchesPeriod = recordDate >= startDate && recordDate <= now;
      const matchesTeacher = selectedTeacher === 'all' || record.teacherId === selectedTeacher;
      return matchesPeriod && matchesTeacher;
    });

    const stats: Record<string, AttendanceStatsType> = {};

    // Calculate stats for each teacher or overall
    const teachersToProcess = selectedTeacher === 'all' ? state.teachers : [state.teachers.find(t => t.id === selectedTeacher)!];

    teachersToProcess.forEach(teacher => {
      const teacherRecords = filteredRecords.filter(r => r.teacherId === teacher.id);
      
      const presentDays = teacherRecords.filter(r => r.status === 'present').length;
      const absentDays = teacherRecords.filter(r => r.status === 'absent').length;
      const lateDays = teacherRecords.filter(r => r.status === 'late').length;
      const halfDays = teacherRecords.filter(r => r.status === 'half-day').length;
      const totalDays = presentDays + absentDays + lateDays + halfDays;
      
      const attendancePercentage = totalDays > 0 ? (presentDays + lateDays + halfDays) / totalDays * 100 : 0;
      const averageWorkingHours = teacherRecords.length > 0 
        ? teacherRecords.reduce((sum, r) => sum + (r.workingHours || 0), 0) / teacherRecords.length 
        : 0;

      stats[teacher.id] = {
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        halfDays,
        attendancePercentage,
        averageWorkingHours,
      };
    });

    return stats;
  }, [attendanceRecords, selectedPeriod, selectedTeacher, state.teachers]);

  const overallStats = useMemo(() => {
    if (selectedTeacher !== 'all') {
      return calculateStats[selectedTeacher];
    }

    const allStats = Object.values(calculateStats);
    if (allStats.length === 0) {
      return {
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        halfDays: 0,
        attendancePercentage: 0,
        averageWorkingHours: 0,
      };
    }

    return {
      totalDays: allStats.reduce((sum, s) => sum + s.totalDays, 0),
      presentDays: allStats.reduce((sum, s) => sum + s.presentDays, 0),
      absentDays: allStats.reduce((sum, s) => sum + s.absentDays, 0),
      lateDays: allStats.reduce((sum, s) => sum + s.lateDays, 0),
      halfDays: allStats.reduce((sum, s) => sum + s.halfDays, 0),
      attendancePercentage: allStats.reduce((sum, s) => sum + s.attendancePercentage, 0) / allStats.length,
      averageWorkingHours: allStats.reduce((sum, s) => sum + s.averageWorkingHours, 0) / allStats.length,
    };
  }, [calculateStats, selectedTeacher]);

  const exportStats = () => {
    // In a real app, this would generate and download a detailed report
    alert('Export functionality would be implemented here');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Attendance Statistics</h1>
              <p className="text-gray-600">Detailed attendance analytics and insights</p>
            </div>
          </div>
          <button
            onClick={exportStats}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'quarter' | 'year')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 90 Days</option>
                <option value="year">Last Year</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-gray-400" />
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
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-blue-600">
              {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Working Days</p>
            <p className="text-2xl font-bold text-gray-900">{overallStats.totalDays}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-600 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              {Math.round(overallStats.attendancePercentage)}%
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Attendance Rate</p>
            <p className="text-2xl font-bold text-gray-900">{Math.round(overallStats.attendancePercentage)}%</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-orange-600">
              Avg Hours
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Working Hours</p>
            <p className="text-2xl font-bold text-gray-900">{overallStats.averageWorkingHours.toFixed(1)}h</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-sm font-medium text-red-600">
              {overallStats.absentDays} Days
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Absences</p>
            <p className="text-2xl font-bold text-gray-900">{overallStats.absentDays}</p>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Attendance Breakdown</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Present Days</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-900">{overallStats.presentDays}</p>
                <p className="text-sm text-green-600">
                  {overallStats.totalDays > 0 ? Math.round((overallStats.presentDays / overallStats.totalDays) * 100) : 0}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-900">Late Days</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-yellow-900">{overallStats.lateDays}</p>
                <p className="text-sm text-yellow-600">
                  {overallStats.totalDays > 0 ? Math.round((overallStats.lateDays / overallStats.totalDays) * 100) : 0}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Half Days</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-900">{overallStats.halfDays}</p>
                <p className="text-sm text-blue-600">
                  {overallStats.totalDays > 0 ? Math.round((overallStats.halfDays / overallStats.totalDays) * 100) : 0}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-900">Absent Days</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-red-900">{overallStats.absentDays}</p>
                <p className="text-sm text-red-600">
                  {overallStats.totalDays > 0 ? Math.round((overallStats.absentDays / overallStats.totalDays) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Performance */}
        {selectedTeacher === 'all' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Teacher Performance</h3>
            
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {state.teachers.map(teacher => {
                const teacherStats = calculateStats[teacher.id];
                if (!teacherStats || teacherStats.totalDays === 0) return null;

                return (
                  <div key={teacher.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{teacher.name}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        teacherStats.attendancePercentage >= 95 ? 'bg-green-100 text-green-800' :
                        teacherStats.attendancePercentage >= 85 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {Math.round(teacherStats.attendancePercentage)}%
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="text-center">
                        <p className="text-gray-500">Present</p>
                        <p className="font-semibold text-green-600">{teacherStats.presentDays}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500">Late</p>
                        <p className="font-semibold text-yellow-600">{teacherStats.lateDays}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500">Half</p>
                        <p className="font-semibold text-blue-600">{teacherStats.halfDays}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500">Absent</p>
                        <p className="font-semibold text-red-600">{teacherStats.absentDays}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${teacherStats.attendancePercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Key Insights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-900">Attendance Trend</h4>
            </div>
            <p className="text-sm text-blue-700">
              {overallStats.attendancePercentage >= 95 
                ? 'Excellent attendance rate! Keep up the good work.'
                : overallStats.attendancePercentage >= 85
                ? 'Good attendance rate with room for improvement.'
                : 'Attendance needs attention. Consider reviewing policies.'
              }
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-green-900">Working Hours</h4>
            </div>
            <p className="text-sm text-green-700">
              Average working hours: {overallStats.averageWorkingHours.toFixed(1)} hours per day.
              {overallStats.averageWorkingHours >= 8 
                ? ' Meeting standard requirements.'
                : ' Below standard working hours.'
              }
            </p>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <h4 className="font-semibold text-yellow-900">Areas to Focus</h4>
            </div>
            <p className="text-sm text-yellow-700">
              {overallStats.lateDays > overallStats.absentDays 
                ? 'Focus on punctuality - more late arrivals than absences.'
                : overallStats.absentDays > 0
                ? 'Monitor absences and provide support where needed.'
                : 'Great performance across all metrics!'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceStats;