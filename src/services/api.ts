import axios from 'axios';
import { Student, Teacher, Invoice, FeeItem } from '../types';

const API_BASE_URL = 'https://kidszone-ho5b.onrender.com/api/';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export default api;