export interface Student {
  id: string;
  name: string;
  grade: string;
  rollNumber: string;
  dateOfBirth: string;
  admissionDate: string;
  age: number;
  parentName?: string;
  parentVerificationCard?: {
    type: 'aadhar' | 'pan';
    number: string;
  };
  parentEmail: string;
  fatherMobile?: string;
  motherMobile?: string;
  fatherPhone?: string;
  motherPhone?: string;
  emergencyNumber: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string;
  dateOfJoining: string;
  fatherName: string;
  age: number;
  verificationCard: {
    type: 'aadhar' | 'pan';
    number: string;
  };
  mobileNumber: string;
  emergencyNumber: string;
}

export interface FeeItem {
  id: string;
  name: string;
  amount: number;
  type: 'monthly' | 'annual' | 'one-time';
  grade?: string;
}

export interface Invoice {
  id: string;
  studentId: string;
  student: Student;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  dueDate: string;
  issueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  invoiceNumber: string;
}

export interface InvoiceItem {
  id: string;
  name: string;
  amount: number;
  quantity: number;
  total: number;
}

export interface SchoolInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo?: string;
}

export interface Attendance {
  id: string;
  teacherId: string;
  teacher: Teacher;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'present' | 'absent' | 'late' | 'half-day';
  workingHours?: number;
  notes?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  halfDays: number;
  attendancePercentage: number;
  averageWorkingHours: number;
}