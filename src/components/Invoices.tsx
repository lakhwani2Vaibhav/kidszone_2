import React, { useState } from 'react';
import { Plus, Search, Eye, Download, Printer, Filter, Calendar, Palette, Edit, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Invoice } from '../types';
import { invoicesApi } from '../services/api';
import InvoiceForm from './InvoiceForm';
import InvoicePreview from './InvoicePreview';
import InvoiceTemplates from './InvoiceTemplates';

const Invoices: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  const filteredInvoices = state.invoices.filter(invoice => {
    const matchesSearch = 
      invoice.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateInvoice = () => {
    setEditingInvoice(null);
    setShowForm(true);
  };

  const handleEditInvoice = (invoice: Invoice, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent row click when edit button is clicked
    }
    setEditingInvoice(invoice);
    setShowForm(true);
  };

  const handleDeleteInvoice = async (invoiceId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent row click when delete button is clicked
    }
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      setLoading(true);
      try {
        await invoicesApi.delete(invoiceId);
        dispatch({ type: 'DELETE_INVOICE', payload: invoiceId });
      } catch (error) {
        console.error('Error deleting invoice:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to delete invoice. Please try again.' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePreviewInvoice = (invoice: Invoice, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent row click when preview button is clicked
    }
    setPreviewInvoice(invoice);
    setShowPreview(true);
  };

  const handleRowClick = (invoice: Invoice) => {
    // When clicking on the row, show preview
    setPreviewInvoice(invoice);
    setShowPreview(true);
  };

  const handleSaveInvoice = (invoice: Invoice) => {
    setShowForm(false);
    setEditingInvoice(null);
  };

  const handleSelectTemplate = (templateId: string) => {
    console.log('Selected template:', templateId);
    setShowTemplates(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (showForm) {
    return (
      <InvoiceForm
        invoice={editingInvoice}
        onSave={handleSaveInvoice}
        onCancel={() => {
          setShowForm(false);
          setEditingInvoice(null);
        }}
      />
    );
  }

  if (showPreview && previewInvoice) {
    return (
      <InvoicePreview
        invoice={previewInvoice}
        onClose={() => {
          setShowPreview(false);
          setPreviewInvoice(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Invoices</h2>
          <p className="text-gray-600">Manage and track student invoices</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowTemplates(true)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
          >
            <Palette className="w-4 h-4 mr-2" />
            Templates
          </button>
          <button
            onClick={handleCreateInvoice}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </button>
        </div>
      </div>

      {/* Template Showcase */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-600 rounded-full">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Beautiful Invoice Templates</h3>
              <p className="text-gray-600">Choose from 5 professionally designed templates to make your invoices stand out</p>
            </div>
          </div>
          <button
            onClick={() => setShowTemplates(true)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium"
          >
            <Palette className="w-4 h-4 mr-2" />
            Browse Templates
          </button>
        </div>
        
        {/* Template Preview */}
        <div className="grid grid-cols-5 gap-4 mt-6">
          {['Classic', 'Modern', 'Colorful', 'Elegant', 'Friendly'].map((template, index) => (
            <div key={template} className="text-center">
              <div className={`w-full h-20 rounded-lg mb-2 ${
                index === 0 ? 'bg-blue-100 border-2 border-blue-300' :
                index === 1 ? 'bg-purple-100 border-2 border-purple-300' :
                index === 2 ? 'bg-pink-100 border-2 border-pink-300' :
                index === 3 ? 'bg-gray-100 border-2 border-gray-300' :
                'bg-green-100 border-2 border-green-300'
              } flex items-center justify-center`}>
                <div className="space-y-1">
                  <div className={`w-8 h-1 rounded ${
                    index === 0 ? 'bg-blue-400' :
                    index === 1 ? 'bg-purple-400' :
                    index === 2 ? 'bg-pink-400' :
                    index === 3 ? 'bg-gray-400' :
                    'bg-green-400'
                  }`}></div>
                  <div className={`w-6 h-1 rounded ${
                    index === 0 ? 'bg-blue-300' :
                    index === 1 ? 'bg-purple-300' :
                    index === 2 ? 'bg-pink-300' :
                    index === 3 ? 'bg-gray-300' :
                    'bg-green-300'
                  }`}></div>
                  <div className={`w-10 h-1 rounded ${
                    index === 0 ? 'bg-blue-300' :
                    index === 1 ? 'bg-purple-300' :
                    index === 2 ? 'bg-pink-300' :
                    index === 3 ? 'bg-gray-300' :
                    'bg-green-300'
                  }`}></div>
                </div>
              </div>
              <p className="text-xs font-medium text-gray-700">{template}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by student name or invoice number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Invoices List */}
      {filteredInvoices.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">All Invoices</h3>
            <p className="text-sm text-gray-500 mt-1">Click on any invoice row to view details</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr 
                    key={invoice.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleRowClick(invoice)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{invoice.invoiceNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.student.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {invoice.student.grade} • Roll: {invoice.student.rollNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{invoice.total.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                        {new Date(invoice.issueDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => handlePreviewInvoice(invoice, e)}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors duration-200"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleEditInvoice(invoice, e)}
                          className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors duration-200"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteInvoice(invoice.id, e)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors duration-200 disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-50 rounded transition-colors duration-200"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-50 rounded transition-colors duration-200"
                          title="Print"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'Create your first invoice to get started'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setShowTemplates(true)}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
              >
                <Palette className="w-4 h-4 mr-2" />
                Browse Templates
              </button>
              <button
                onClick={handleCreateInvoice}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Invoice
              </button>
            </div>
          )}
        </div>
      )}

      {/* Templates Modal */}
      {showTemplates && (
        <InvoiceTemplates
          invoice={filteredInvoices[0] || {} as Invoice}
          onClose={() => setShowTemplates(false)}
          onSelectTemplate={handleSelectTemplate}
        />
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-900 font-medium">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;