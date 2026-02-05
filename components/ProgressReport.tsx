'use client';

import React, { useState } from 'react';
import {
    Calendar,
    TrendingUp,
    BookOpen,
    Award,
    Target,
    Clock,
    ChevronRight,
    Download,
    FileText,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProgressUpdate {
    id: string;
    date: string;
    type: 'academic' | 'financial' | 'milestone' | 'general';
    title: string;
    description: string;
    metrics?: { label: string; value: string }[];
}

interface QuarterlyReportData {
    studentName: string;
    studentId: string;
    quarter: string;
    period: { start: string; end: string };
    academicProgress: {
        gpa: number;
        credits: number;
        coursesCompleted: number;
    };
    financialSummary: {
        received: number;
        spent: number;
        remaining: number;
    };
    updates: ProgressUpdate[];
    nextMilestone?: string;
}

interface QuarterlyReportProps extends QuarterlyReportData {
    className?: string;
    onDownloadPDF?: () => void;
}

// PDF Export function
function exportReportToPDF(report: QuarterlyReportData) {
    const reportWindow = window.open('', '_blank');
    if (reportWindow) {
        const formatCurrency = (value: number) => `$${value.toLocaleString()}`;
        const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        reportWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${report.quarter} Raporu - ${report.studentName}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                    h1 { color: #2563EB; border-bottom: 2px solid #2563EB; padding-bottom: 10px; }
                    h2 { color: #374151; margin-top: 30px; }
                    .header { background: linear-gradient(to right, #2563EB, #4F46E5); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
                    .header h1 { color: white; border: none; margin: 0; }
                    .header p { color: rgba(255,255,255,0.8); margin: 5px 0 0 0; }
                    .stats { display: flex; gap: 20px; margin: 20px 0; }
                    .stat { flex: 1; text-align: center; background: #F3F4F6; padding: 15px; border-radius: 8px; }
                    .stat-value { font-size: 28px; font-weight: bold; color: #2563EB; }
                    .stat-label { font-size: 12px; color: #6B7280; }
                    .financial { background: #F0FDF4; padding: 15px; border-radius: 8px; margin: 20px 0; }
                    .financial-row { display: flex; justify-content: space-between; padding: 8px 0; }
                    .update { display: flex; gap: 15px; padding: 15px 0; border-bottom: 1px solid #E5E7EB; }
                    .update-icon { width: 40px; height: 40px; background: #EEF2FF; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
                    .update-content { flex: 1; }
                    .update-title { font-weight: 600; margin-bottom: 4px; }
                    .update-desc { color: #6B7280; font-size: 14px; }
                    .milestone { background: linear-gradient(to right, #F5F3FF, #FDF2F8); padding: 15px; border-radius: 8px; margin-top: 20px; }
                    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; text-align: center; color: #9CA3AF; font-size: 12px; }
                    @media print { body { padding: 20px; } .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>📊 ${report.quarter} Ilerleme Raporu</h1>
                    <p>${report.studentName} • ${formatDate(report.period.start)} - ${formatDate(report.period.end)}</p>
                </div>
                
                <h2>📚 Akademik Ilerleme</h2>
                <div class="stats">
                    <div class="stat">
                        <div class="stat-value">${report.academicProgress.gpa.toFixed(2)}</div>
                        <div class="stat-label">GPA Ortalama</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${report.academicProgress.credits}</div>
                        <div class="stat-label">Tamamlanan Kredi</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${report.academicProgress.coursesCompleted}</div>
                        <div class="stat-label">Tamamlanan Ders</div>
                    </div>
                </div>
                
                <h2>💰 Finansal Ozet</h2>
                <div class="financial">
                    <div class="financial-row">
                        <span>Alinan Bagis</span>
                        <span style="color: #16A34A; font-weight: 600;">${formatCurrency(report.financialSummary.received)}</span>
                    </div>
                    <div class="financial-row">
                        <span>Harcanan</span>
                        <span style="color: #DC2626; font-weight: 600;">-${formatCurrency(report.financialSummary.spent)}</span>
                    </div>
                    <div class="financial-row" style="border-top: 1px solid #D1D5DB; padding-top: 10px; margin-top: 5px;">
                        <span style="font-weight: 600;">Kalan Bakiye</span>
                        <span style="color: #2563EB; font-weight: 700;">${formatCurrency(report.financialSummary.remaining)}</span>
                    </div>
                </div>
                
                <h2>📝 Donem Guncellemeleri</h2>
                ${report.updates.map(update => `
                    <div class="update">
                        <div class="update-icon">📌</div>
                        <div class="update-content">
                            <div class="update-title">${update.title}</div>
                            <div class="update-desc">${update.description}</div>
                            <div style="font-size: 12px; color: #9CA3AF; margin-top: 5px;">${formatDate(update.date)}</div>
                        </div>
                    </div>
                `).join('')}
                
                ${report.nextMilestone ? `
                    <div class="milestone">
                        <strong>🎯 Sonraki Hedef:</strong> ${report.nextMilestone}
                    </div>
                ` : ''}
                
                <div class="footer">
                    <p>Bu rapor FundEd platformu tarafindan otomatik olarak olusturulmustur.</p>
                    <p>Olusturma Tarihi: ${new Date().toLocaleDateString('tr-TR')}</p>
                </div>
            </body>
            </html>
        `);
        reportWindow.document.close();
        reportWindow.print();
    }
}

export function QuarterlyReport({
    studentName,
    studentId,
    quarter,
    period,
    academicProgress,
    financialSummary,
    updates,
    nextMilestone,
    className,
}: QuarterlyReportProps) {
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const getUpdateIcon = (type: ProgressUpdate['type']) => {
        switch (type) {
            case 'academic':
                return BookOpen;
            case 'financial':
                return TrendingUp;
            case 'milestone':
                return Award;
            default:
                return FileText;
        }
    };

    const getUpdateColor = (type: ProgressUpdate['type']) => {
        switch (type) {
            case 'academic':
                return 'bg-blue-100 text-blue-600';
            case 'financial':
                return 'bg-green-100 text-green-600';
            case 'milestone':
                return 'bg-purple-100 text-purple-600';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    const handleDownloadPDF = () => {
        exportReportToPDF({
            studentName,
            studentId,
            quarter,
            period,
            academicProgress,
            financialSummary,
            updates,
            nextMilestone,
        });
    };

    return (
        <div className={cn('bg-white rounded-xl shadow-sm border overflow-hidden', className)}>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
                <div className="flex items-center justify-between mb-4">
                    <Badge className="bg-white/20 text-white">{quarter} Raporu</Badge>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20 gap-2"
                        onClick={handleDownloadPDF}
                    >
                        <Download className="h-4 w-4" />
                        PDF Indir
                    </Button>
                </div>
                <h2 className="text-2xl font-bold mb-1">{studentName}</h2>
                <p className="text-blue-100 text-sm">
                    {formatDate(period.start)} - {formatDate(period.end)}
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 p-6 border-b">
                <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{academicProgress.gpa.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Ortalama (GPA)</p>
                </div>
                <div className="text-center border-x">
                    <p className="text-3xl font-bold text-green-600">{academicProgress.credits}</p>
                    <p className="text-sm text-gray-500">Tamamlanan Kredi</p>
                </div>
                <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">{academicProgress.coursesCompleted}</p>
                    <p className="text-sm text-gray-500">Ders</p>
                </div>
            </div>

            {/* Financial Summary */}
            <div className="p-6 border-b">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Finansal Ozet
                </h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Alinan Bagis</span>
                        <span className="font-semibold text-green-600">{formatCurrency(financialSummary.received)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Harcanan</span>
                        <span className="font-semibold text-red-600">-{formatCurrency(financialSummary.spent)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-gray-900 font-medium">Kalan</span>
                        <span className="font-bold text-blue-600">{formatCurrency(financialSummary.remaining)}</span>
                    </div>
                </div>
            </div>

            {/* Updates Timeline */}
            <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Donem Guncellemeleri
                </h3>
                <div className="space-y-4">
                    {updates.map((update) => {
                        const Icon = getUpdateIcon(update.type);
                        return (
                            <div key={update.id} className="flex gap-4">
                                <div className={cn('p-2 rounded-lg h-fit', getUpdateColor(update.type))}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-medium text-gray-900">{update.title}</h4>
                                        <span className="text-xs text-gray-500">{formatDate(update.date)}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{update.description}</p>
                                    {update.metrics && (
                                        <div className="flex gap-4">
                                            {update.metrics.map((metric) => (
                                                <div key={metric.label} className="text-xs">
                                                    <span className="text-gray-500">{metric.label}: </span>
                                                    <span className="font-medium text-gray-900">{metric.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Next Milestone */}
            {nextMilestone && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-t">
                    <div className="flex items-center gap-3">
                        <Target className="h-6 w-6 text-purple-600" />
                        <div>
                            <p className="text-sm text-purple-600 font-medium">Sonraki Hedef</p>
                            <p className="text-gray-900">{nextMilestone}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Progress Reports List with Modal
interface ReportListItem {
    id: string;
    quarter: string;
    date: string;
    studentName: string;
}

interface ProgressReportsListProps {
    reports: ReportListItem[];
    className?: string;
}

export function ProgressReportsList({ reports, className }: ProgressReportsListProps) {
    const [selectedReport, setSelectedReport] = useState<QuarterlyReportData | null>(null);

    // Generate mock report data based on quarter
    const getReportData = (report: ReportListItem): QuarterlyReportData => {
        // Demo data - all financial values zero
        const quarterData: Record<string, QuarterlyReportData> = {
            'Q4 2025': {
                studentName: report.studentName,
                studentId: report.id,
                quarter: 'Q4 2025',
                period: { start: '2025-10-01', end: '2025-12-31' },
                academicProgress: { gpa: 0, credits: 0, coursesCompleted: 0 },
                financialSummary: { received: 0, spent: 0, remaining: 0 },
                updates: [
                    { id: '1', date: '2025-12-15', type: 'general', title: 'Demo Guncelleme', description: 'Bu bir demo guncellemesidir.' },
                ],
                nextMilestone: 'Platform aktif oldugunda guncellenecektir.',
            },
            'Q3 2025': {
                studentName: report.studentName,
                studentId: report.id,
                quarter: 'Q3 2025',
                period: { start: '2025-07-01', end: '2025-09-30' },
                academicProgress: { gpa: 0, credits: 0, coursesCompleted: 0 },
                financialSummary: { received: 0, spent: 0, remaining: 0 },
                updates: [
                    { id: '1', date: '2025-09-15', type: 'general', title: 'Demo Guncelleme', description: 'Bu bir demo guncellemesidir.' },
                ],
                nextMilestone: 'Platform aktif oldugunda guncellenecektir.',
            },
            'Q2 2025': {
                studentName: report.studentName,
                studentId: report.id,
                quarter: 'Q2 2025',
                period: { start: '2025-04-01', end: '2025-06-30' },
                academicProgress: { gpa: 0, credits: 0, coursesCompleted: 0 },
                financialSummary: { received: 0, spent: 0, remaining: 0 },
                updates: [
                    { id: '1', date: '2025-06-15', type: 'general', title: 'Demo Guncelleme', description: 'Bu bir demo guncellemesidir.' },
                ],
                nextMilestone: 'Platform aktif oldugunda guncellenecektir.',
            },
        };
        return quarterData[report.quarter] || quarterData['Q4 2025'];
    };

    const handleReportClick = (report: ReportListItem) => {
        setSelectedReport(getReportData(report));
    };

    const handleDownloadPDF = (report: ReportListItem, e: React.MouseEvent) => {
        e.stopPropagation();
        exportReportToPDF(getReportData(report));
    };

    return (
        <>
            <div className={cn('space-y-3', className)}>
                {reports.map((report) => (
                    <div
                        key={report.id}
                        onClick={() => handleReportClick(report)}
                        className="bg-white rounded-xl p-4 shadow-sm border flex items-center justify-between hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                                <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">{report.quarter} Raporu</h4>
                                <p className="text-sm text-gray-500">{report.studentName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                onClick={(e) => handleDownloadPDF(report, e)}
                            >
                                <Download className="h-4 w-4 mr-1" />
                                PDF
                            </Button>
                            <span className="text-sm text-gray-500">{report.date}</span>
                            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Report Modal */}
            {selectedReport && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">{selectedReport.quarter} Raporu - {selectedReport.studentName}</h3>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => exportReportToPDF(selectedReport)}
                                    className="gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    PDF Indir
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSelectedReport(null)}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                        <div className="p-0">
                            <QuarterlyReport {...selectedReport} className="border-0 shadow-none" />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// Mock data
// Demo data - all financial values zero
export const mockQuarterlyReport: QuarterlyReportData = {
    studentName: 'Demo Ogrenci',
    studentId: 'demo-1',
    quarter: 'Q4 2025',
    period: { start: '2025-10-01', end: '2025-12-31' },
    academicProgress: {
        gpa: 0,
        credits: 0,
        coursesCompleted: 0,
    },
    financialSummary: {
        received: 0,
        spent: 0,
        remaining: 0,
    },
    updates: [
        {
            id: '1',
            date: '2025-12-15',
            type: 'general',
            title: 'Demo Guncelleme',
            description: 'Bu bir demo guncellemesidir. Gercek veriler platform aktif oldugunda gorunecektir.',
        },
    ],
    nextMilestone: 'Platform aktif oldugunda guncellenecektir.',
};

// Export the function for external use
export { exportReportToPDF };
