import React, { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Invoice, InvoiceItem } from '../types';
import { invoicesApi } from '../services/api';

interface InvoiceFormProps {
  invoice: Invoice | null;
  onSave: (invoice: Invoice) => void;
  onCancel: () => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoice, onSave, onCancel }) => {
  const { state, dispatch } = useApp();
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<'pending' | 'paid' | 'overdue'>('pending');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const taxRate = 0.08; // 8% tax rate

  useEffect(() => {
    if (invoice) {
      setSelectedStudentId(invoice.studentId);
      setItems(invoice.items);
      setDueDate(invoice.dueDate);
      setStatus(invoice.status);
    } else {
      // Set default due date to 30 days from now
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 30);
      setDueDate(defaultDueDate.toISOString().split('T')[0]);
    }
  }, [invoice]);

  const selectedStudent = state.students.find(s => s.id === selectedStudentId);

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const addFeeItem = (feeItem: any) => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      name: feeItem.name,
      amount: feeItem.amount,
      quantity: 1,
      total: feeItem.amount,
    };
    setItems([...items, newItem]);
  };

  const addCustomItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      name: 'Custom Item',
      amount: 0,
      quantity: 1,
      total: 0,
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'amount' || field === 'quantity') {
          updatedItem.total = Number(updatedItem.amount) * Number(updatedItem.quantity);
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedStudentId) newErrors.student = 'Please select a student';
    if (items.length === 0) newErrors.items = 'Please add at least one item';
    if (!dueDate) newErrors.dueDate = 'Please set a due date';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !selectedStudent) return;

    setLoading(true);
    try {
      const invoiceNumber = invoice?.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`;
      const issueDate = invoice?.issueDate || new Date().toISOString().split('T')[0];

      const invoiceData = {
        studentId: selectedStudentId,
        student: selectedStudent,
        items,
        subtotal,
        tax,
        total,
        dueDate,
        issueDate,
        status,
        invoiceNumber,
      };

      let savedInvoice: Invoice;

      if (invoice) {
        const response = await invoicesApi.update(invoice.id, invoiceData);
        savedInvoice = response.data;
        dispatch({ type: 'UPDATE_INVOICE', payload: savedInvoice });
      } else {
        const response = await invoicesApi.create(invoiceData);
        savedInvoice = response.data;
        dispatch({ type: 'ADD_INVOICE', payload: savedInvoice });
      }

      onSave(savedInvoice);
    } catch (error) {
      console.error('Error saving invoice:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save invoice. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {invoice ? 'Edit Invoice' : 'Create New Invoice'}
              </h1>
              <p className="text-gray-600">Generate and manage student invoices</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h3>
          <div>
            <label htmlFor="student" className="block text-sm font-medium text-gray-700 mb-2">
              Select Student *
            </label>
            <select
              id="student"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.student ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={!!invoice}
            >
              <option value="">Choose a student</option>
              {state.students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name} - {student.grade} (Roll: {student.rollNumber})
                </option>
              ))}
            </select>
            {errors.student && <p className="text-red-500 text-xs mt-1">{errors.student}</p>}
          </div>

          {/* Student Info Display */}
          {selectedStudent && (
            <div className="bg-blue-50 p-4 rounded-lg mt-4">
              <h4 className="font-semibold text-blue-900 mb-2">Student Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Name:</strong> {selectedStudent.name}</p>
                  <p><strong>Grade:</strong> {selectedStudent.grade}</p>
                  <p><strong>Roll Number:</strong> {selectedStudent.rollNumber}</p>
                </div>
                <div>
                  <p><strong>Parent:</strong> {selectedStudent.parentName || 'Not specified'}</p>
                  <p><strong>Email:</strong> {selectedStudent.parentEmail}</p>
                  <p><strong>Emergency:</strong> {selectedStudent.emergencyNumber}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Invoice Items */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Invoice Items</h3>
            <div className="flex space-x-2">
              <div className="relative">
                <select
                  onChange={(e) => {
                    const feeItem = state.feeItems.find(f => f.id === e.target.value);
                    if (feeItem) {
                      addFeeItem(feeItem);
                    }
                    e.target.value = '';
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Add Fee Item</option>
                  {state.feeItems.map(feeItem => (
                    <option key={feeItem.id} value={feeItem.id}>
                      {feeItem.name} - ₹{feeItem.amount}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={addCustomItem}
                className="flex items-center px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-1" />
                Custom Item
              </button>
            </div>
          </div>

          {items.length > 0 ? (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Item name"
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      value={item.amount}
                      onChange={(e) => updateItem(item.id, 'amount', Number(e.target.value))}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Amount"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Qty"
                      min="1"
                    />
                  </div>
                  <div className="w-24 text-right">
                    <span className="font-medium">₹{item.total.toFixed(2)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">No items added yet. Add fee items or custom items above.</p>
            </div>
          )}
          {errors.items && <p className="text-red-500 text-xs mt-1">{errors.items}</p>}
        </div>

        {/* Invoice Summary */}
        {items.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Summary</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax ({(taxRate * 100).toFixed(0)}%):</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-300">
                  <span>Total:</span>
                  <span className="text-blue-600">₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Due Date and Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.dueDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'pending' | 'paid' | 'overdue')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Saving...' : (invoice ? 'Update Invoice' : 'Create Invoice')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;