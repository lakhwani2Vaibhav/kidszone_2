import React, { useState } from 'react';
import { X, Download, Printer, Palette, Share2 } from 'lucide-react';
import { Invoice } from '../types';
import { useApp } from '../context/AppContext';
import InvoiceTemplates from './InvoiceTemplates';

interface InvoicePreviewProps {
  invoice: Invoice;
  onClose: () => void;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, onClose }) => {
  const { state } = useApp();
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('classic');

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real app, this would generate and download a PDF
    alert('PDF download functionality would be implemented here');
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    setShowTemplates(false);
  };

  const handleWebsiteClick = () => {
    window.open('https://kidszoneacademyy.netlify.app/', '_blank');
  };

  const getTemplateStyles = () => {
    switch (selectedTemplate) {
      case 'classic':
        return {
          headerBg: 'bg-blue-600',
          headerText: 'text-white',
          accentColor: 'text-blue-600',
          borderColor: 'border-blue-200',
          bgColor: 'bg-blue-50'
        };
      case 'modern':
        return {
          headerBg: 'bg-gray-900',
          headerText: 'text-white',
          accentColor: 'text-purple-600',
          borderColor: 'border-purple-200',
          bgColor: 'bg-purple-50'
        };
      case 'colorful':
        return {
          headerBg: 'bg-gradient-to-r from-pink-500 to-rose-500',
          headerText: 'text-white',
          accentColor: 'text-pink-600',
          borderColor: 'border-pink-200',
          bgColor: 'bg-pink-50'
        };
      case 'elegant':
        return {
          headerBg: 'bg-gray-800',
          headerText: 'text-white',
          accentColor: 'text-gray-700',
          borderColor: 'border-gray-300',
          bgColor: 'bg-gray-50'
        };
      case 'friendly':
        return {
          headerBg: 'bg-gradient-to-r from-green-500 to-emerald-500',
          headerText: 'text-white',
          accentColor: 'text-green-600',
          borderColor: 'border-green-200',
          bgColor: 'bg-green-50'
        };
      default:
        return {
          headerBg: 'bg-blue-600',
          headerText: 'text-white',
          accentColor: 'text-blue-600',
          borderColor: 'border-blue-200',
          bgColor: 'bg-blue-50'
        };
    }
  };

  const styles = getTemplateStyles();

  return (
    <>
      <div className="max-w-4xl mx-auto">
        {/* Header with actions */}
        <div className="bg-white rounded-t-lg shadow-sm border border-gray-200 border-b-0 p-4 flex justify-between items-center print:hidden">
          <h2 className="text-xl font-semibold text-gray-900">Invoice Preview</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowTemplates(true)}
              className="flex items-center px-3 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors duration-200"
            >
              <Palette className="w-4 h-4 mr-1" />
              Templates
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center px-3 py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50 transition-colors duration-200"
            >
              <Download className="w-4 h-4 mr-1" />
              Download PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors duration-200"
            >
              <Printer className="w-4 h-4 mr-1" />
              Print
            </button>
            <button
              className="flex items-center px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="bg-white rounded-b-lg shadow-sm border border-gray-200 overflow-hidden" id="invoice-content">
          {/* School Header */}
          <div className={`${styles.headerBg} p-8 ${styles.headerText}`}>
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-6">
                {/* Logo */}
                <div className="flex-shrink-0">
                  <img 
                    src={state.schoolInfo.logo} 
                    alt={state.schoolInfo.name}
                    className="w-20 h-20 rounded-lg bg-white p-2 shadow-lg"
                    onError={(e) => {
                      // Fallback if logo fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                
                {/* School Info */}
                <div>
                  <h1 className="text-3xl font-bold mb-2">{state.schoolInfo.name}</h1>
                  <p className="opacity-90 mb-2">{state.schoolInfo.address}</p>
                  <div className="flex flex-wrap gap-4 text-sm opacity-80">
                    <span>Phone: {state.schoolInfo.phone}</span>
                    <span>Email: {state.schoolInfo.email}</span>
                    <button 
                      onClick={handleWebsiteClick}
                      className="hover:underline cursor-pointer"
                    >
                      Web: {state.schoolInfo.website}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Decorative Element for Colorful Template */}
              {selectedTemplate === 'colorful' && (
                <div className="hidden lg:block">
                  <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🎓</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            <div>
              <h2 className={`text-2xl font-bold ${styles.accentColor} mb-4`}>INVOICE</h2>
              <div className="space-y-1 text-sm">
                <p><strong>Invoice Number:</strong> {invoice.invoiceNumber}</p>
                <p><strong>Issue Date:</strong> {new Date(invoice.issueDate).toLocaleDateString()}</p>
                <p><strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}</p>
                <p>
                  <strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {invoice.status.toUpperCase()}
                  </span>
                </p>
              </div>
            </div>

            <div className="text-right md:text-left">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
              <div className="text-sm space-y-1">
                <p className="font-semibold">{invoice.student.parentName || 'Parent/Guardian'}</p>
                <p>Parent/Guardian of {invoice.student.name}</p>
                <p>{state.schoolInfo.address}</p>
                <p>{invoice.student.emergencyNumber}</p>
                <p>{invoice.student.parentEmail}</p>
              </div>
            </div>
          </div>

          {/* Student Information */}
          <div className={`${styles.bgColor} ${styles.borderColor} border-l-4 mx-8 p-4 rounded-lg mb-8`}>
            <h3 className={`font-semibold ${styles.accentColor} mb-2`}>Student Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p><strong>Name:</strong> {invoice.student.name}</p>
              </div>
              <div>
                <p><strong>Grade:</strong> {invoice.student.grade}</p>
              </div>
              <div>
                <p><strong>Roll Number:</strong> {invoice.student.rollNumber}</p>
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="mx-8 mb-8">
            <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
              <thead>
                <tr className={`${styles.bgColor}`}>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Description</th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Quantity</th>
                  <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Unit Price</th>
                  <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3">{item.name}</td>
                    <td className="border border-gray-300 px-4 py-3 text-center">{item.quantity}</td>
                    <td className="border border-gray-300 px-4 py-3 text-right">₹{item.amount.toFixed(2)}</td>
                    <td className="border border-gray-300 px-4 py-3 text-right font-semibold">₹{item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Invoice Totals */}
          <div className="flex justify-end mx-8 mb-8">
            <div className="w-64">
              <div className="space-y-2">
                <div className="flex justify-between py-1">
                  <span>Subtotal:</span>
                  <span>₹{invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Tax (8%):</span>
                  <span>₹{invoice.tax.toFixed(2)}</span>
                </div>
                <div className={`flex justify-between py-2 border-t-2 ${styles.borderColor} font-bold text-lg`}>
                  <span>Total Amount:</span>
                  <span className={styles.accentColor}>₹{invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="mx-8 border-t pt-6 pb-8">
            <h3 className="font-semibold text-gray-900 mb-3">Payment Instructions</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• Payment is due by the date specified above.</p>
              <p>• Please include the invoice number with your payment.</p>
              <p>• For questions about this invoice, please contact our office.</p>
              <p>• Late payments may incur additional fees.</p>
              <p>• All amounts are in Indian Rupees (₹).</p>
            </div>
          </div>

          {/* Footer */}
          <div className={`${styles.headerBg} text-center py-6 text-sm ${styles.headerText} opacity-90`}>
            <p>Thank you for choosing {state.schoolInfo.name}!</p>
            <p className="mt-2">This is a computer-generated invoice.</p>
          </div>
        </div>
      </div>

      {/* Templates Modal */}
      {showTemplates && (
        <InvoiceTemplates
          invoice={invoice}
          onClose={() => setShowTemplates(false)}
          onSelectTemplate={handleSelectTemplate}
        />
      )}
    </>
  );
};

export default InvoicePreview;