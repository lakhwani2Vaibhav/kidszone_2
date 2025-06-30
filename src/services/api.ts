import axios from 'axios';
import { Student, Teacher, Invoice, FeeItem, Admin, AuthUser, Attendance } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  login: (credentials: { username: string; password: string }) => 
    api.post<{ user: AuthUser; token: string }>('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get<AuthUser>('/auth/me'),
};

// Admin API
export const adminApi = {
  getAll: () => api.get<Admin[]>('/admin'),
  create: (admin: Omit<Admin, 'id' | 'createdAt' | 'updatedAt'>) => 
    api.post<Admin>('/admin', admin),
  update: (id: string, admin: Partial<Admin>) => 
    api.put<Admin>(`/admin/${id}`, admin),
  delete: (id: string) => api.delete(`/admin/${id}`),
};

// Students API
export const studentsApi = {
  getAll: () => api.get<Student[]>('/students'),
  getById: (id: string) => api.get<Student>(`/students/${id}`),
  create: (student: Omit<Student, 'id' | 'rollNumber'>) => api.post<Student>('/students', student),
  update: (id: string, student: Partial<Student>) => api.put<Student>(`/students/${id}`, student),
  delete: (id: string) => api.delete(`/students/${id}`),
  getNextRollNumber: () => api.get<{ rollNumber: string }>('/students/next-roll-number'),
};

// Teachers API
export const teachersApi = {
  getAll: () => api.get<Teacher[]>('/teachers'),
  getById: (id: string) => api.get<Teacher>(`/teachers/${id}`),
  create: (teacher: Omit<Teacher, 'id'>) => api.post<Teacher>('/teachers', teacher),
  update: (id: string, teacher: Partial<Teacher>) => api.put<Teacher>(`/teachers/${id}`, teacher),
  delete: (id: string) => api.delete(`/teachers/${id}`),
};

// Invoices API
export const invoicesApi = {
  getAll: () => api.get<Invoice[]>('/invoices'),
  getById: (id: string) => api.get<Invoice>(`/invoices/${id}`),
  create: (invoice: Omit<Invoice, 'id'>) => api.post<Invoice>('/invoices', invoice),
  update: (id: string, invoice: Partial<Invoice>) => api.put<Invoice>(`/invoices/${id}`, invoice),
  delete: (id: string) => api.delete(`/invoices/${id}`),
};

// Fee Items API
export const feeItemsApi = {
  getAll: () => api.get<FeeItem[]>('/fee-items'),
  getById: (id: string) => api.get<FeeItem>(`/fee-items/${id}`),
  create: (feeItem: Omit<FeeItem, 'id'>) => api.post<FeeItem>('/fee-items', feeItem),
  update: (id: string, feeItem: Partial<FeeItem>) => api.put<FeeItem>(`/fee-items/${id}`, feeItem),
  delete: (id: string) => api.delete(`/fee-items/${id}`),
};

// Attendance API
export const attendanceApi = {
  getAll: () => api.get<Attendance[]>('/attendance'),
  getByTeacher: (teacherId: string) => api.get<Attendance[]>(`/attendance/teacher/${teacherId}`),
  getByDate: (date: string) => api.get<Attendance[]>(`/attendance/date/${date}`),
  create: (attendance: Omit<Attendance, 'id' | 'createdAt' | 'updatedAt'>) => 
    api.post<Attendance>('/attendance', attendance),
  update: (id: string, attendance: Partial<Attendance>) => 
    api.put<Attendance>(`/attendance/${id}`, attendance),
  delete: (id: string) => api.delete(`/attendance/${id}`),
  checkIn: (teacherId: string, data: { location?: string; notes?: string }) => 
    api.post<Attendance>(`/attendance/check-in/${teacherId}`, data),
  checkOut: (teacherId: string, data: { notes?: string }) => 
    api.post<Attendance>(`/attendance/check-out/${teacherId}`, data),
};

export default api;