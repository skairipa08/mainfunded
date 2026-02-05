'use client';

import React from 'react';
import { FileText, Download, Calendar, TrendingUp } from 'lucide-react';
import { QuarterlyReport, ProgressReportsList, mockQuarterlyReport, exportReportToPDF } from '@/components/ProgressReport';
import { Button } from '@/components/ui/button';
import MobileHeader from '@/components/MobileHeader';

export default function ReportsPage() {
    const mockReports = [
        { id: '1', quarter: 'Q4 2025', date: '15 Ocak 2026', studentName: 'Elif Yilmaz' },
        { id: '2', quarter: 'Q3 2025', date: '15 Ekim 2025', studentName: 'Elif Yilmaz' },
        { id: '3', quarter: 'Q2 2025', date: '15 Temmuz 2025', studentName: 'Elif Yilmaz' },
        { id: '4', quarter: 'Q4 2025', date: '15 Ocak 2026', studentName: 'Mehmet Kaya' },
        { id: '5', quarter: 'Q3 2025', date: '15 Ekim 2025', studentName: 'Mehmet Kaya' },
        { id: '6', quarter: 'Q4 2025', date: '15 Ocak 2026', studentName: 'Ayse Demir' },
    ];

    const handleDownloadAll = () => {
        const reportWindow = window.open('', '_blank');
        if (reportWindow) {
            const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

            const reportsData = [
                { name: 'Demo Ogrenci A', quarter: 'Q4 2025', gpa: 0, credits: 0, received: 0, spent: 0 },
                { name: 'Demo Ogrenci B', quarter: 'Q4 2025', gpa: 0, credits: 0, received: 0, spent: 0 },
            ];

            reportWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Tum Ilerleme Raporlari - FundEd</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; max-width: 900px; margin: 0 auto; }
                        h1 { color: #2563EB; border-bottom: 3px solid #2563EB; padding-bottom: 15px; text-align: center; }
                        h2 { color: #374151; margin-top: 40px; page-break-before: always; }
                        h2:first-of-type { page-break-before: auto; }
                        .summary { background: #F3F4F6; padding: 20px; border-radius: 12px; margin: 20px 0; }
                        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; text-align: center; }
                        .summary-item { background: white; padding: 15px; border-radius: 8px; }
                        .summary-value { font-size: 24px; font-weight: bold; color: #2563EB; }
                        .summary-label { font-size: 12px; color: #6B7280; }
                        .report-card { border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px; margin: 15px 0; }
                        .report-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #E5E7EB; }
                        .report-name { font-size: 18px; font-weight: 600; color: #1F2937; }
                        .report-quarter { background: #EEF2FF; color: #4F46E5; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
                        .report-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
                        .stat { text-align: center; padding: 10px; background: #F9FAFB; border-radius: 8px; }
                        .stat-value { font-size: 20px; font-weight: bold; }
                        .stat-label { font-size: 11px; color: #6B7280; }
                        .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #E5E7EB; text-align: center; color: #9CA3AF; font-size: 12px; }
                        @media print { 
                            body { padding: 20px; } 
                            h2 { page-break-before: always; }
                            .report-card { page-break-inside: avoid; }
                        }
                    </style>
                </head>
                <body>
                    <h1>📊 FundEd Ilerleme Raporlari</h1>
                    <p style="text-align: center; color: #6B7280;">Tum ogrenci raporlari - ${new Date().toLocaleDateString('tr-TR')}</p>
                    
                    <div class="summary">
                        <h3 style="margin-top: 0; text-align: center; color: #374151;">Genel Ozet</h3>
                        <div class="summary-grid">
                            <div class="summary-item">
                                <div class="summary-value">${reportsData.length}</div>
                                <div class="summary-label">Toplam Rapor</div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-value">3</div>
                                <div class="summary-label">Ogrenci</div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-value">3.53</div>
                                <div class="summary-label">Ortalama GPA</div>
                            </div>
                        </div>
                    </div>
                    
                    <h2>📚 Detayli Raporlar</h2>
                    
                    ${reportsData.map(report => `
                        <div class="report-card">
                            <div class="report-header">
                                <span class="report-name">${report.name}</span>
                                <span class="report-quarter">${report.quarter}</span>
                            </div>
                            <div class="report-stats">
                                <div class="stat">
                                    <div class="stat-value" style="color: #2563EB;">${report.gpa.toFixed(2)}</div>
                                    <div class="stat-label">GPA</div>
                                </div>
                                <div class="stat">
                                    <div class="stat-value" style="color: #7C3AED;">${report.credits}</div>
                                    <div class="stat-label">Kredi</div>
                                </div>
                                <div class="stat">
                                    <div class="stat-value" style="color: #16A34A;">${formatCurrency(report.received)}</div>
                                    <div class="stat-label">Alinan</div>
                                </div>
                                <div class="stat">
                                    <div class="stat-value" style="color: #DC2626;">${formatCurrency(report.spent)}</div>
                                    <div class="stat-label">Harcanan</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                    
                    <div class="footer">
                        <p>Bu rapor FundEd platformu tarafindan otomatik olarak olusturulmustur.</p>
                        <p>Toplam ${reportsData.length} rapor • Olusturma Tarihi: ${new Date().toLocaleDateString('tr-TR')}</p>
                    </div>
                </body>
                </html>
            `);
            reportWindow.document.close();
            reportWindow.print();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Mobile Header */}
            <MobileHeader transparent backHref="/" />

            {/* Hero */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white py-16 -mt-14 pt-20">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <FileText className="h-10 w-10" />
                        <h1 className="text-4xl font-bold">Ilerleme Raporlari</h1>
                    </div>
                    <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-8">
                        Desteklediginiz ogrencilerin 3 aylik akademik ve finansal ilerleme raporlari
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                            <p className="text-3xl font-bold">0</p>
                            <p className="text-sm text-blue-100">Toplam Rapor</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                            <p className="text-3xl font-bold">0</p>
                            <p className="text-sm text-blue-100">Ogrenci</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                            <p className="text-3xl font-bold">0</p>
                            <p className="text-sm text-blue-100">Ort. GPA</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Demo Notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-center gap-3">
                    <span className="text-amber-600 font-bold text-lg">⚠️</span>
                    <p className="text-amber-800 text-sm font-medium">Bu sayfa demo amaclidir. Raporlar ve tutarlar ornek icin gosterilmektedir; gercek veriler platform aktif oldugunda guncellenecektir.</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Sample Report */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">En Son Rapor</h2>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => exportReportToPDF(mockQuarterlyReport)}
                                className="gap-2"
                            >
                                <Download className="h-4 w-4" />
                                PDF Indir
                            </Button>
                        </div>
                        <QuarterlyReport {...mockQuarterlyReport} />
                    </div>

                    {/* Report List */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Tum Raporlar</h2>
                            <span className="text-sm text-gray-500">{mockReports.length} rapor</span>
                        </div>

                        <ProgressReportsList reports={mockReports} />

                        {/* Info Box */}
                        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                            <div className="flex items-start gap-3">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-blue-900 mb-1">Otomatik Raporlama</h4>
                                    <p className="text-sm text-blue-700">
                                        Her 3 ayda bir, desteklediginiz ogrencinin akademik performansi,
                                        finansal durumu ve onemli gelismeleri hakkinda detayli rapor alirsiniz.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Download All */}
                        <div className="mt-4 bg-white rounded-xl p-5 border shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 p-2 rounded-lg">
                                        <TrendingUp className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Toplu Indirme</h4>
                                        <p className="text-sm text-gray-500">Tum raporlari tek PDF olarak indirin</p>
                                    </div>
                                </div>
                                <Button onClick={handleDownloadAll} className="gap-2 bg-green-600 hover:bg-green-700">
                                    <Download className="h-4 w-4" />
                                    Tumu Indir
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
