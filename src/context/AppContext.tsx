import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Student, Teacher, Invoice, FeeItem, SchoolInfo, Attendance } from '../types';
import { studentsApi, teachersApi, invoicesApi, feeItemsApi } from '../services/api';

interface AppState {
  students: Student[];
  teachers: Teacher[];
  invoices: Invoice[];
  feeItems: FeeItem[];
  attendance: Attendance[];
  schoolInfo: SchoolInfo;
  loading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_STUDENTS'; payload: Student[] }
  | { type: 'ADD_STUDENT'; payload: Student }
  | { type: 'UPDATE_STUDENT'; payload: Student }
  | { type: 'DELETE_STUDENT'; payload: string }
  | { type: 'SET_TEACHERS'; payload: Teacher[] }
  | { type: 'ADD_TEACHER'; payload: Teacher }
  | { type: 'UPDATE_TEACHER'; payload: Teacher }
  | { type: 'DELETE_TEACHER'; payload: string }
  | { type: 'SET_INVOICES'; payload: Invoice[] }
  | { type: 'ADD_INVOICE'; payload: Invoice }
  | { type: 'UPDATE_INVOICE'; payload: Invoice }
  | { type: 'DELETE_INVOICE'; payload: string }
  | { type: 'SET_FEE_ITEMS'; payload: FeeItem[] }
  | { type: 'ADD_FEE_ITEM'; payload: FeeItem }
  | { type: 'UPDATE_FEE_ITEM'; payload: FeeItem }
  | { type: 'DELETE_FEE_ITEM'; payload: string }
  | { type: 'SET_ATTENDANCE'; payload: Attendance[] }
  | { type: 'ADD_ATTENDANCE'; payload: Attendance }
  | { type: 'UPDATE_ATTENDANCE'; payload: Attendance }
  | { type: 'DELETE_ATTENDANCE'; payload: string }
  | { type: 'UPDATE_SCHOOL_INFO'; payload: SchoolInfo };

const initialState: AppState = {
  students: [],
  teachers: [],
  invoices: [],
  feeItems: [],
  attendance: [],
  loading: false,
  error: null,
  schoolInfo: {
    name: "KID'S ZONE ACADEMY",
    address: 'Infront Of St. Mary\'s School Zamania Ghazipur Uttar Pradesh',
    phone: '+91 6388842678',
    email: 'kidszoneacademyy@gmail.com',
    website: 'kidzoneacademyy.in',
    logo: '/Kid-Zone Logo.png',
  },
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_STUDENTS':
      return { ...state, students: action.payload };
    case 'ADD_STUDENT':
      return { ...state, students: [...state.students, action.payload] };
    case 'UPDATE_STUDENT':
      return {
        ...state,
        students: state.students.map(s => s.id === action.payload.id ? action.payload : s),
      };
    case 'DELETE_STUDENT':
      return {
        ...state,
        students: state.students.filter(s => s.id !== action.payload),
        invoices: state.invoices.filter(i => i.studentId !== action.payload),
      };
    case 'SET_TEACHERS':
      return { ...state, teachers: action.payload };
    case 'ADD_TEACHER':
      return { ...state, teachers: [...state.teachers, action.payload] };
    case 'UPDATE_TEACHER':
      return {
        ...state,
        teachers: state.teachers.map(t => t.id === action.payload.id ? action.payload : t),
      };
    case 'DELETE_TEACHER':
      return {
        ...state,
        teachers: state.teachers.filter(t => t.id !== action.payload),
        attendance: state.attendance.filter(a => a.teacherId !== action.payload),
      };
    case 'SET_INVOICES':
      return { ...state, invoices: action.payload };
    case 'ADD_INVOICE':
      return { ...state, invoices: [...state.invoices, action.payload] };
    case 'UPDATE_INVOICE':
      return {
        ...state,
        invoices: state.invoices.map(i => i.id === action.payload.id ? action.payload : i),
      };
    case 'DELETE_INVOICE':
      return {
        ...state,
        invoices: state.invoices.filter(i => i.id !== action.payload),
      };
    case 'SET_FEE_ITEMS':
      return { ...state, feeItems: action.payload };
    case 'ADD_FEE_ITEM':
      return { ...state, feeItems: [...state.feeItems, action.payload] };
    case 'UPDATE_FEE_ITEM':
      return {
        ...state,
        feeItems: state.feeItems.map(f => f.id === action.payload.id ? action.payload : f),
      };
    case 'DELETE_FEE_ITEM':
      return {
        ...state,
        feeItems: state.feeItems.filter(f => f.id !== action.payload),
      };
    case 'SET_ATTENDANCE':
      return { ...state, attendance: action.payload };
    case 'ADD_ATTENDANCE':
      return { ...state, attendance: [...state.attendance, action.payload] };
    case 'UPDATE_ATTENDANCE':
      return {
        ...state,
        attendance: state.attendance.map(a => a.id === action.payload.id ? action.payload : a),
      };
    case 'DELETE_ATTENDANCE':
      return {
        ...state,
        attendance: state.attendance.filter(a => a.id !== action.payload),
      };
    case 'UPDATE_SCHOOL_INFO':
      return { ...state, schoolInfo: action.payload };
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  loadData: () => Promise<void>;
} | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const loadData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Load all data in parallel
      const [studentsRes, teachersRes, invoicesRes, feeItemsRes] = await Promise.all([
        studentsApi.getAll().catch(() => ({ data: [] })),
        teachersApi.getAll().catch(() => ({ data: [] })),
        invoicesApi.getAll().catch(() => ({ data: [] })),
        feeItemsApi.getAll().catch(() => ({ data: [] })),
      ]);

      dispatch({ type: 'SET_STUDENTS', payload: studentsRes.data });
      dispatch({ type: 'SET_TEACHERS', payload: teachersRes.data });
      dispatch({ type: 'SET_INVOICES', payload: invoicesRes.data });
      dispatch({ type: 'SET_FEE_ITEMS', payload: feeItemsRes.data });
    } catch (error) {
      console.error('Error loading data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load data. Using offline mode.' });
      
      // Fallback to default fee items if API fails
      const defaultFeeItems: FeeItem[] = [
        { id: '1', name: 'Tuition Fee', amount: 2500, type: 'monthly' },
        { id: '2', name: 'Transportation', amount: 800, type: 'monthly' },
        { id: '3', name: 'Activity Fee', amount: 500, type: 'monthly' },
        { id: '4', name: 'Admission Fee', amount: 5000, type: 'one-time' },
      ];
      dispatch({ type: 'SET_FEE_ITEMS', payload: defaultFeeItems });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, loadData }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};