import React from 'react';
import { Download, Printer, X } from 'lucide-react';
import { Teacher } from '../types';
import { useApp } from '../context/AppContext';

interface TeacherIDCardProps {
  teacher: Teacher;
  onClose: () => void;
}

const TeacherIDCard: React.FC<TeacherIDCardProps> = ({ teacher, onClose }) => {
  const { state } = useApp();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a new window for printing/downloading
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Teacher ID Card - ${teacher.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
            * { 
              margin: 0; 
              padding: 0; 
              box-sizing: border-box; 
              font-family: 'Poppins', sans-serif; 
            }
            
            body { 
              background: #f0f0f0; 
              padding: 20px; 
              display: flex;
              flex-direction: column;
              align-items: center;
              min-height: 100vh;
            }
            
            .page { 
              width: 210mm; 
              min-height: 297mm; 
              background: white; 
              margin: 0 auto 20px; 
              padding: 20mm; 
              page-break-after: always;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            
            .page-title {
              text-align: center;
              margin-bottom: 30px;
              color: #1f2937;
              font-size: 24px;
              font-weight: 600;
            }
            
            .id-card { 
              width: 85.6mm; 
              height: 53.98mm; 
              border-radius: 8px; 
              overflow: hidden; 
              box-shadow: 0 8px 25px rgba(0,0,0,0.15);
              border: 2px solid #e5e7eb;
            }
            
            .front-card { 
              background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); 
              border: 2px solid #16a34a; 
            }
            
            .back-card { 
              background: linear-gradient(135deg, #f9fafb 0%, #dcfce7 100%); 
              border: 2px solid #6b7280; 
            }
            
            .card-header { 
              text-align: center; 
              padding: 6px; 
              background: rgba(22, 163, 74, 0.1); 
              border-bottom: 1px solid #16a34a; 
            }
            
            .school-name { 
              font-size: 9px; 
              font-weight: 700; 
              color: #15803d; 
              margin-bottom: 2px; 
              line-height: 1.2;
            }
            
            .card-type { 
              font-size: 6px; 
              color: #166534; 
              font-weight: 500;
            }
            
            .card-body { 
              padding: 6px; 
              height: calc(100% - 40px);
              display: flex;
              flex-direction: column;
            }
            
            .photo-section { 
              text-align: center; 
              margin-bottom: 6px; 
            }
            
            .photo-placeholder { 
              width: 32px; 
              height: 38px; 
              background: #e5e7eb; 
              border-radius: 4px; 
              margin: 0 auto; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              border: 2px solid white; 
              box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
            }
            
            .photo-initial { 
              width: 20px; 
              height: 20px; 
              background: #dcfce7; 
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-size: 10px; 
              font-weight: 700; 
              color: #16a34a; 
            }
            
            .teacher-name { 
              font-size: 10px; 
              font-weight: 700; 
              color: #111827; 
              text-align: center; 
              margin: 4px 0 2px; 
              line-height: 1.1;
            }
            
            .teacher-designation { 
              font-size: 7px; 
              color: #16a34a; 
              font-weight: 600; 
              text-align: center; 
              margin-bottom: 4px; 
            }
            
            .details-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 3px; 
              margin-bottom: 4px; 
              flex: 1;
            }
            
            .detail-item { 
              background: white; 
              padding: 3px; 
              border-radius: 3px; 
              box-shadow: 0 1px 2px rgba(0,0,0,0.05); 
            }
            
            .detail-label { 
              font-size: 5px; 
              color: #6b7280; 
              margin-bottom: 1px; 
              font-weight: 500;
            }
            
            .detail-value { 
              font-size: 6px; 
              font-weight: 700; 
              color: #111827; 
              line-height: 1.1;
            }
            
            .full-width { 
              grid-column: 1 / -1; 
            }
            
            .card-footer { 
              text-align: center; 
              padding-top: 4px; 
              border-top: 1px solid #16a34a; 
              margin-top: auto;
            }
            
            .academic-year { 
              font-size: 5px; 
              color: #166534; 
              font-weight: 600; 
            }
            
            .issue-date { 
              font-size: 4px; 
              color: #6b7280; 
              margin-top: 1px; 
            }
            
            .back-content { 
              padding: 6px; 
              height: 100%;
              display: flex;
              flex-direction: column;
            }
            
            .back-title { 
              font-size: 8px; 
              font-weight: 700; 
              color: #111827; 
              text-align: center; 
              margin-bottom: 4px; 
            }
            
            .back-section { 
              margin-bottom: 4px; 
            }
            
            .back-section-title { 
              font-size: 6px; 
              font-weight: 600; 
              color: #111827; 
              margin-bottom: 2px; 
            }
            
            .back-text { 
              font-size: 5px; 
              color: #374151; 
              line-height: 1.3; 
              margin-bottom: 1px;
            }
            
            .instructions { 
              list-style: none; 
              margin: 0;
              padding: 0;
            }
            
            .instructions li { 
              font-size: 4px; 
              color: #374151; 
              margin-bottom: 1px; 
              line-height: 1.2;
            }
            
            .motto { 
              background: #dcfce7; 
              padding: 3px; 
              border-radius: 3px; 
              text-align: center; 
              margin-top: auto;
            }
            
            .motto-text { 
              font-size: 5px; 
              color: #15803d; 
              font-weight: 600; 
            }
            
            @media print { 
              body { 
                background: white; 
                padding: 0; 
              } 
              .page { 
                margin: 0; 
                padding: 10mm; 
                box-shadow: none; 
                page-break-after: always;
              }
              .page-title {
                font-size: 18px;
                margin-bottom: 20px;
              }
            }
            
            @page {
              size: A4;
              margin: 10mm;
            }
          </style>
        </head>
        <body>
          <!-- Front Side Page -->
          <div class="page">
            <h2 class="page-title">Teacher ID Card - Front</h2>
            <div class="id-card front-card">
              <div class="card-header">
                <div class="school-name">${state.schoolInfo.name}</div>
                <div class="card-type">Faculty Identity Card</div>
              </div>
              <div class="card-body">
                <div class="photo-section">
                  <div class="photo-placeholder">
                    <div class="photo-initial">${teacher.name.charAt(0).toUpperCase()}</div>
                  </div>
                </div>
                <div class="teacher-name">${teacher.name}</div>
                <div class="teacher-designation">Faculty Member</div>
                <div class="details-grid">
                  <div class="detail-item">
                    <div class="detail-label">Employee ID</div>
                    <div class="detail-value">EMP${teacher.id?.slice(-4) || '0001'}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Age</div>
                    <div class="detail-value">${teacher.age} years</div>
                  </div>
                  <div class="detail-item full-width">
                    <div class="detail-label">Date of Joining</div>
                    <div class="detail-value">${new Date(teacher.dateOfJoining).toLocaleDateString('en-IN')}</div>
                  </div>
                  <div class="detail-item full-width">
                    <div class="detail-label">Mobile Number</div>
                    <div class="detail-value">${teacher.mobileNumber}</div>
                  </div>
                  <div class="detail-item full-width">
                    <div class="detail-label">Emergency Contact</div>
                    <div class="detail-value">${teacher.emergencyNumber}</div>
                  </div>
                </div>
                <div class="card-footer">
                  <div class="academic-year">Academic Year 2024-25</div>
                  <div class="issue-date">Issued: ${new Date().toLocaleDateString('en-IN')}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Back Side Page -->
          <div class="page">
            <h2 class="page-title">Teacher ID Card - Back</h2>
            <div class="id-card back-card">
              <div class="back-content">
                <div class="back-title">Professional Information</div>
                <div class="back-section">
                  <div class="back-section-title">Personal Details:</div>
                  <div class="back-text">Email: ${teacher.email}</div>
                  <div class="back-text">Father's Name: ${teacher.fatherName}</div>
                </div>
                <div class="back-section">
                  <div class="back-section-title">School Address:</div>
                  <div class="back-text">${state.schoolInfo.address}</div>
                </div>
                <div class="back-section">
                  <div class="back-section-title">Contact Information:</div>
                  <div class="back-text">Phone: ${state.schoolInfo.phone}</div>
                  <div class="back-text">Website: ${state.schoolInfo.website}</div>
                </div>
                <div class="back-section">
                  <div class="back-section-title">Guidelines:</div>
                  <ul class="instructions">
                    <li>• This card must be displayed during school hours</li>
                    <li>• Report immediately if lost or damaged</li>
                    <li>• Valid for current academic year only</li>
                    <li>• Non-transferable</li>
                  </ul>
                </div>
                <div class="motto">
                  <div class="motto-text">"Inspiring Minds, Shaping Futures"</div>
                </div>
              </div>
            </div>
          </div>
          
          <script>
            // Auto-trigger print dialog after content loads
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
            
            // Close window after printing
            window.onafterprint = function() {
              setTimeout(function() {
                window.close();
              }, 1000);
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
    } else {
      alert('Pop-up blocked. Please allow pop-ups for this site to download the ID card.');
    }
  };

  const calculateExperience = () => {
    const joiningDate = new Date(teacher.dateOfJoining);
    const currentDate = new Date();
    const years = currentDate.getFullYear() - joiningDate.getFullYear();
    const months = currentDate.getMonth() - joiningDate.getMonth();
    
    if (months < 0) {
      return `${years - 1} years`;
    }
    return `${years} years`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Teacher ID Card Preview</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownload}
                className="flex items-center px-3 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors"
                title="Download & Print PDF"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center px-3 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors"
                title="Print"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </button>
              <button
                onClick={onClose}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          <div className="space-y-8">
            {/* Front Side */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Front Side</h3>
              <div className="inline-block">
                <div className="w-80 h-48 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border-2 border-green-200 shadow-lg">
                  {/* School Header */}
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <img 
                      src={state.schoolInfo.logo} 
                      alt={state.schoolInfo.name}
                      className="w-8 h-8 rounded-lg shadow-md"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="text-center">
                      <h1 className="text-sm font-bold text-green-900">{state.schoolInfo.name}</h1>
                      <p className="text-xs text-green-700">Faculty Identity Card</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    {/* Photo */}
                    <div className="w-16 h-20 bg-gray-200 rounded-lg border-2 border-white shadow-md flex items-center justify-center flex-shrink-0">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
                          <span className="text-lg font-bold text-green-600">
                            {teacher.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">Photo</p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 space-y-2">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">{teacher.name}</h2>
                        <p className="text-sm text-green-600 font-medium">Faculty Member</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white rounded p-2 shadow-sm">
                          <p className="text-gray-500">Emp ID</p>
                          <p className="font-bold text-gray-900">EMP{teacher.id?.slice(-4) || '0001'}</p>
                        </div>
                        <div className="bg-white rounded p-2 shadow-sm">
                          <p className="text-gray-500">Experience</p>
                          <p className="font-bold text-gray-900">{calculateExperience()}</p>
                        </div>
                      </div>

                      <div className="bg-white rounded p-2 shadow-sm text-xs">
                        <p className="text-gray-500">Mobile</p>
                        <p className="font-bold text-gray-900">{teacher.mobileNumber}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-green-200 text-center">
                    <p className="text-xs text-green-700 font-medium">Academic Year 2024-25</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Back Side */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Back Side</h3>
              <div className="inline-block">
                <div className="w-80 h-48 bg-gradient-to-br from-gray-50 to-green-50 rounded-xl p-6 border-2 border-gray-200 shadow-lg">
                  <div className="text-center mb-3">
                    <h3 className="text-sm font-bold text-gray-900">Professional Information</h3>
                    <div className="w-full h-px bg-gray-300 mt-1"></div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Personal Details:</h4>
                      <p className="text-gray-700">Email: {teacher.email}</p>
                      <p className="text-gray-700">Father: {teacher.fatherName}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">School Address:</h4>
                      <p className="text-gray-700">{state.schoolInfo.address}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Contact:</h4>
                      <p className="text-gray-700">Phone: {state.schoolInfo.phone}</p>
                      <p className="text-gray-700">Website: {state.schoolInfo.website}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Guidelines:</h4>
                      <ul className="text-gray-700 text-xs space-y-1">
                        <li>• Display during school hours</li>
                        <li>• Report if lost</li>
                        <li>• Valid for current year</li>
                        <li>• Non-transferable</li>
                      </ul>
                    </div>

                    <div className="bg-green-100 rounded p-2 mt-2">
                      <p className="text-xs text-green-800 text-center font-medium">
                        "Inspiring Minds, Shaping Futures"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherIDCard;