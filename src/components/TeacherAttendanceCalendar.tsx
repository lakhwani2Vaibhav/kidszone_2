import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  User,
  TrendingUp
} from 'lucide-react';
import { Teacher, Attendance } from '../types';
import { attendanceApi } from '../services/api';

interface TeacherAttendanceCalendarProps {
  teacher: Teacher;
}

const TeacherAttendanceCalendar: React.FC<TeacherAttendanceCalendarProps> = ({ teacher }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceData();
  }, [teacher.id, currentDate]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await attendanceApi.getByTeacher(teacher.id);
      setAttendanceRecords(response.data);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      // Generate mock data for demonstration
      generateMockData();
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    const mockData: Attendance[] = [];
    const today = new Date();
    
    // Generate data for last 60 days
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      const random = Math.random();
      let status: 'present' | 'absent' | 'late' | 'half-day';
      let checkInTime = '';
      let checkOutTime = '';
      let workingHours = 0;
      
      if (random > 0.95) {
        status = 'absent';
      } else if (random > 0.85) {
        status = 'late';
        checkInTime = '09:30:00';
        checkOutTime = '17:30:00';
        workingHours = 8;
      } else if (random > 0.92) {
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
      
      mockData.push({
        id: `mock-${i}`,
        teacherId: teacher.id,
        teacher,
        date: date.toISOString().split('T')[0],
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
    
    setAttendanceRecords(mockData);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getAttendanceForDate = (date: string) => {
    return attendanceRecords.find(record => record.date === date);
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
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 border-green-300';
      case 'late':
        return 'bg-yellow-100 border-yellow-300';
      case 'absent':
        return 'bg-red-100 border-red-300';
      case 'half-day':
        return 'bg-blue-100 border-blue-300';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calculate stats for current month
  const currentMonthRecords = attendanceRecords.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate.getMonth() === month && recordDate.getFullYear() === year;
  });

  const stats = {
    totalDays: currentMonthRecords.length,
    presentDays: currentMonthRecords.filter(r => r.status === 'present').length,
    lateDays: currentMonthRecords.filter(r => r.status === 'late').length,
    absentDays: currentMonthRecords.filter(r => r.status === 'absent').length,
    halfDays: currentMonthRecords.filter(r => r.status === 'half-day').length,
  };

  const attendancePercentage = stats.totalDays > 0 
    ? Math.round(((stats.presentDays + stats.lateDays + stats.halfDays) / stats.totalDays) * 100)
    : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{teacher.name}</h3>
            <p className="text-sm text-gray-500">Attendance Calendar</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-sm text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span className="font-semibold">{attendancePercentage}%</span>
          </div>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <h2 className="text-xl font-semibold text-gray-900">
          {monthNames[month]} {year}
        </h2>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {/* Day Headers */}
        {dayNames.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
        
        {/* Empty cells for days before month starts */}
        {Array.from({ length: firstDay }, (_, i) => (
          <div key={`empty-${i}`} className="p-2"></div>
        ))}
        
        {/* Calendar Days */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const attendance = getAttendanceForDate(dateStr);
          const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
          const isWeekend = new Date(year, month, day).getDay() === 0 || new Date(year, month, day).getDay() === 6;
          
          return (
            <div
              key={day}
              className={`
                relative p-2 h-12 border rounded-lg transition-all duration-200 cursor-pointer hover:shadow-md
                ${isToday ? 'ring-2 ring-blue-500' : ''}
                ${isWeekend ? 'bg-gray-50' : 'bg-white'}
                ${attendance ? getStatusColor(attendance.status) : 'border-gray-200'}
              `}
              title={attendance ? `${attendance.status} - ${attendance.checkInTime || 'No time recorded'}` : 'No record'}
            >
              <div className="flex items-center justify-between h-full">
                <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                  {day}
                </span>
                {attendance && !isWeekend && (
                  <div className="absolute top-1 right-1">
                    {getStatusIcon(attendance.status)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-sm text-gray-600">Present</span>
        </div>
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-yellow-600" />
          <span className="text-sm text-gray-600">Late</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-gray-600">Half Day</span>
        </div>
        <div className="flex items-center space-x-2">
          <XCircle className="w-4 h-4 text-red-600" />
          <span className="text-sm text-gray-600">Absent</span>
        </div>
      </div>

      {/* Monthly Stats */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Monthly Summary</h4>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{stats.totalDays}</div>
            <div className="text-gray-600">Total Days</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{stats.presentDays}</div>
            <div className="text-gray-600">Present</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-600">{stats.lateDays}</div>
            <div className="text-gray-600">Late</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{stats.halfDays}</div>
            <div className="text-gray-600">Half Day</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{stats.absentDays}</div>
            <div className="text-gray-600">Absent</div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Attendance Rate</span>
            <span className="text-lg font-bold text-blue-600">{attendancePercentage}%</span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${attendancePercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Loading attendance data...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAttendanceCalendar;