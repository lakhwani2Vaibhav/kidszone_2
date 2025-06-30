import React, { useState } from 'react';
import { X, Check, Eye, Download, Palette, Star, Crown, Zap, Heart, Sparkles } from 'lucide-react';
import { Invoice } from '../types';

interface InvoiceTemplatesProps {
  invoice: Invoice;
  onClose: () => void;
  onSelectTemplate: (templateId: string) => void;
}

const InvoiceTemplates: React.FC<InvoiceTemplatesProps> = ({ invoice, onClose, onSelectTemplate }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

  const templates = [
    {
      id: 'classic',
      name: 'Classic Professional',
      description: 'Clean and professional design perfect for business',
      icon: Crown,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      preview: 'A traditional layout with clean lines and professional typography'
    },
    {
      id: 'modern',
      name: 'Modern Minimalist',
      description: 'Contemporary design with bold typography',
      icon: Zap,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      preview: 'Sleek modern design with emphasis on white space and clarity'
    },
    {
      id: 'colorful',
      name: 'Colorful Creative',
      description: 'Vibrant and engaging design for creative businesses',
      icon: Palette,
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      preview: 'Bright and cheerful design with colorful accents and playful elements'
    },
    {
      id: 'elegant',
      name: 'Elegant Premium',
      description: 'Sophisticated design with premium feel',
      icon: Star,
      color: 'from-gray-700 to-gray-800',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      preview: 'Luxurious design with elegant typography and refined styling'
    },
    {
      id: 'friendly',
      name: 'Friendly School',
      description: 'Warm and approachable design perfect for schools',
      icon: Heart,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      preview: 'Warm and welcoming design with friendly colors and rounded elements'
    }
  ];

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handlePreview = (templateId: string) => {
    setPreviewTemplate(templateId);
  };

  const handleApplyTemplate = () => {
    onSelectTemplate(selectedTemplate);
    onClose();
  };

  const renderTemplatePreview = (template: any) => {
    const Icon = template.icon;
    
    return (
      <div className={`w-full h-64 ${template.bgColor} ${template.borderColor} border-2 rounded-lg p-4 relative overflow-hidden`}>
        {/* Template Preview Content */}
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className={`w-8 h-8 bg-gradient-to-r ${template.color} rounded-lg flex items-center justify-center`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div className="text-right">
              <div className="w-16 h-2 bg-gray-300 rounded mb-1"></div>
              <div className="w-12 h-2 bg-gray-200 rounded"></div>
            </div>
          </div>
          
          {/* School Info */}
          <div className="space-y-1">
            <div className="w-32 h-3 bg-gray-400 rounded"></div>
            <div className="w-24 h-2 bg-gray-300 rounded"></div>
            <div className="w-28 h-2 bg-gray-300 rounded"></div>
          </div>
          
          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-1">
              <div className="w-16 h-2 bg-gray-400 rounded"></div>
              <div className="w-20 h-2 bg-gray-300 rounded"></div>
              <div className="w-18 h-2 bg-gray-300 rounded"></div>
            </div>
            <div className="space-y-1">
              <div className="w-14 h-2 bg-gray-400 rounded"></div>
              <div className="w-22 h-2 bg-gray-300 rounded"></div>
              <div className="w-16 h-2 bg-gray-300 rounded"></div>
            </div>
          </div>
          
          {/* Items Table */}
          <div className="mt-4 space-y-1">
            <div className="flex space-x-2">
              <div className="w-20 h-2 bg-gray-400 rounded"></div>
              <div className="w-8 h-2 bg-gray-400 rounded"></div>
              <div className="w-12 h-2 bg-gray-400 rounded"></div>
            </div>
            <div className="flex space-x-2">
              <div className="w-20 h-2 bg-gray-200 rounded"></div>
              <div className="w-8 h-2 bg-gray-200 rounded"></div>
              <div className="w-12 h-2 bg-gray-200 rounded"></div>
            </div>
            <div className="flex space-x-2">
              <div className="w-20 h-2 bg-gray-200 rounded"></div>
              <div className="w-8 h-2 bg-gray-200 rounded"></div>
              <div className="w-12 h-2 bg-gray-200 rounded"></div>
            </div>
          </div>
          
          {/* Total */}
          <div className="flex justify-end mt-4">
            <div className="space-y-1">
              <div className="w-16 h-2 bg-gray-400 rounded"></div>
              <div className="w-20 h-3 bg-gray-600 rounded"></div>
            </div>
          </div>
        </div>
        
        {/* Template Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 rounded-lg"></div>
        
        {/* Selection Indicator */}
        {selectedTemplate === template.id && (
          <div className="absolute top-2 right-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Choose Invoice Template</h2>
                <p className="text-blue-100">Select a beautiful template for your invoice</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {templates.map((template) => {
              const Icon = template.icon;
              return (
                <div
                  key={template.id}
                  className={`relative group cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    selectedTemplate === template.id 
                      ? 'ring-4 ring-blue-500 ring-opacity-50' 
                      : 'hover:shadow-lg'
                  }`}
                  onClick={() => handleSelectTemplate(template.id)}
                >
                  {/* Template Preview */}
                  {renderTemplatePreview(template)}
                  
                  {/* Template Info */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 bg-gradient-to-r ${template.color} rounded-lg`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-500">{template.description}</p>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreview(template.id);
                        }}
                        className="flex-1 flex items-center justify-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectTemplate(template.id);
                        }}
                        className={`flex-1 flex items-center justify-center px-3 py-2 text-sm rounded-lg transition-colors ${
                          selectedTemplate === template.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        {selectedTemplate === template.id ? 'Selected' : 'Select'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Template Info */}
          {selectedTemplate && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-600 rounded-full">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">
                    {templates.find(t => t.id === selectedTemplate)?.name} Template Selected
                  </h3>
                  <p className="text-blue-700">
                    {templates.find(t => t.id === selectedTemplate)?.preview}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Professional layouts</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Customizable colors</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Print-ready designs</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">PDF export support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {templates.length} professional templates available
            </div>
            <div className="flex space-x-4">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyTemplate}
                disabled={!selectedTemplate}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4 mr-2" />
                Apply Template
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplates;