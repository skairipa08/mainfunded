'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Search,
  X,
  SlidersHorizontal,
  Clock,
  Sparkles,
  Hash,
  Users,
} from 'lucide-react';
import {
  QuarterlyReport,
  ProgressReportsList,
  mockQuarterlyReport,
  exportReportToPDF,
} from '@/components/ProgressReport';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useTranslation } from '@/lib/i18n/context';
import { useCurrency } from '@/lib/currency-context';
import { cn } from '@/lib/utils';

const ALL_QUARTERS = ['all', 'Q4 2025', 'Q3 2025', 'Q2 2025'];

export default function ReportsPage() {
  const { t } = useTranslation();
  const { formatAmount } = useCurrency();

  const mockReports = [
    { id: '1', quarter: 'Q4 2025', date: '15 Ocak 2026', studentName: 'Elif Yilmaz' },
    { id: '2', quarter: 'Q3 2025', date: '15 Ekim 2025', studentName: 'Elif Yilmaz' },
    { id: '3', quarter: 'Q2 2025', date: '15 Temmuz 2025', studentName: 'Elif Yilmaz' },
    { id: '4', quarter: 'Q4 2025', date: '15 Ocak 2026', studentName: 'Mehmet Kaya' },
    { id: '5', quarter: 'Q3 2025', date: '15 Ekim 2025', studentName: 'Mehmet Kaya' },
    { id: '6', quarter: 'Q4 2025', date: '15 Ocak 2026', studentName: 'Ayse Demir' },
  ];

  // --- Search & Filter State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState('all');
  const [sortBy, setSortBy] = useState<'recent' | 'student'>('recent');
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const heroSearchRef = useRef<HTMLDivElement>(null);
  const stickySearchInputRef = useRef<HTMLInputElement>(null);

  // IntersectionObserver — show sticky bar when hero search scrolls out of view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
    );
    if (heroSearchRef.current) {
      observer.observe(heroSearchRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const clearSearch = useCallback(() => setSearchQuery(''), []);

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedQuarter('all');
    setSortBy('recent');
  }, []);

  const hasActiveFilters =
    searchQuery.trim() !== '' || selectedQuarter !== 'all' || sortBy !== 'recent';

  // --- Filtering & Sorting ---
  const filteredReports = useMemo(() => {
    let reports = [...mockReports];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      reports = reports.filter(
        (r) =>
          r.studentName.toLowerCase().includes(q) ||
          r.quarter.toLowerCase().includes(q) ||
          r.date.toLowerCase().includes(q)
      );
    }

    if (selectedQuarter !== 'all') {
      reports = reports.filter((r) => r.quarter === selectedQuarter);
    }

    if (sortBy === 'student') {
      reports.sort((a, b) => a.studentName.localeCompare(b.studentName));
    } else {
      reports.sort((a, b) => b.id.localeCompare(a.id));
    }

    return reports;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedQuarter, sortBy]);

  // --- Bulk Download ---
  const handleDownloadAll = () => {
    const reportWindow = window.open('', '_blank');
    if (reportWindow) {
      const formatCurrency = (value: number) => formatAmount(value);
      const reportsData = [
        { name: 'Demo Öğrenci A', quarter: 'Q4 2025', gpa: 0, credits: 0, received: 0, spent: 0 },
        { name: 'Demo Öğrenci B', quarter: 'Q4 2025', gpa: 0, credits: 0, received: 0, spent: 0 },
      ];

      reportWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Tüm İlerleme Raporları - FundEd</title>
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
            @media print { body { padding: 20px; } h2 { page-break-before: always; } .report-card { page-break-inside: avoid; } }
          </style>
        </head>
        <body>
          <h1>📊 FundEd İlerleme Raporları</h1>
          <p style="text-align: center; color: #6B7280;">Tüm öğrenci raporları - ${new Date().toLocaleDateString('tr-TR')}</p>
          <div class="summary">
            <h3 style="margin-top: 0; text-align: center; color: #374151;">Genel Özet</h3>
            <div class="summary-grid">
              <div class="summary-item"><div class="summary-value">${reportsData.length}</div><div class="summary-label">Toplam Rapor</div></div>
              <div class="summary-item"><div class="summary-value">3</div><div class="summary-label">Öğrenci</div></div>
              <div class="summary-item"><div class="summary-value">3.53</div><div class="summary-label">Ortalama GPA</div></div>
            </div>
          </div>
          <h2>📚 Detaylı Raporlar</h2>
          ${reportsData
            .map(
              (report) => `
            <div class="report-card">
              <div class="report-header">
                <span class="report-name">${report.name}</span>
                <span class="report-quarter">${report.quarter}</span>
              </div>
              <div class="report-stats">
                <div class="stat"><div class="stat-value" style="color: #2563EB;">${report.gpa.toFixed(2)}</div><div class="stat-label">GPA</div></div>
                <div class="stat"><div class="stat-value" style="color: #7C3AED;">${report.credits}</div><div class="stat-label">Kredi</div></div>
                <div class="stat"><div class="stat-value" style="color: #16A34A;">${formatCurrency(report.received)}</div><div class="stat-label">Alinan</div></div>
                <div class="stat"><div class="stat-value" style="color: #DC2626;">${formatCurrency(report.spent)}</div><div class="stat-label">Harcanan</div></div>
              </div>
            </div>`
            )
            .join('')}
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
      {/* ===== Navbar (sticky top banner) ===== */}
      <Navbar />

      {/* ===== Sticky Search Bar (appears on scroll) ===== */}
      <div
        className={cn(
          'fixed top-0 left-0 right-0 z-[60] transition-all duration-300',
          showStickyBar
            ? 'translate-y-0 opacity-100'
            : '-translate-y-full opacity-0 pointer-events-none'
        )}
      >
        <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg">
          <div className="container mx-auto px-4 py-3">
            <div className="max-w-4xl mx-auto flex items-center gap-3">
              {/* Sticky Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={stickySearchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rapor veya öğrenci ara..."
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 placeholder:text-gray-400 text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Sticky Quarter Pills */}
              <div className="hidden md:flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
                {ALL_QUARTERS.map((q) => (
                  <button
                    key={q}
                    onClick={() => setSelectedQuarter(q)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                      selectedQuarter === q
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                    )}
                  >
                    {q === 'all' ? 'Tümü' : q}
                  </button>
                ))}
              </div>

              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className={cn(
                  'md:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border',
                  hasActiveFilters
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-gray-50 text-gray-600 border-gray-200'
                )}
              >
                <SlidersHorizontal className="h-4 w-4" />
                {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
              </button>

              {/* Sort Toggle */}
              <div className="hidden md:flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setSortBy('recent')}
                  className={cn(
                    'px-2.5 py-1.5 rounded-md text-xs font-medium transition-all',
                    sortBy === 'recent'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  <Clock className="h-3 w-3 inline mr-1" />
                  En Yeni
                </button>
                <button
                  onClick={() => setSortBy('student')}
                  className={cn(
                    'px-2.5 py-1.5 rounded-md text-xs font-medium transition-all',
                    sortBy === 'student'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  <Users className="h-3 w-3 inline mr-1" />
                  Öğrenci
                </button>
              </div>

              {/* Clear All */}
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="hidden md:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="h-3 w-3" />
                  Temizle
                </button>
              )}
            </div>

            {/* Mobile Filters Expanded */}
            {showMobileFilters && (
              <div className="md:hidden mt-3 pt-3 border-t border-gray-100">
                <div className="flex flex-wrap gap-2 mb-3">
                  {ALL_QUARTERS.map((q) => (
                    <button
                      key={q}
                      onClick={() => setSelectedQuarter(q)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                        selectedQuarter === q
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600'
                      )}
                    >
                      {q === 'all' ? 'Tümü' : q}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
                    <button
                      onClick={() => setSortBy('recent')}
                      className={cn(
                        'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                        sortBy === 'recent' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500'
                      )}
                    >
                      En Yeni
                    </button>
                    <button
                      onClick={() => setSortBy('student')}
                      className={cn(
                        'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                        sortBy === 'student' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500'
                      )}
                    >
                      Öğrenci
                    </button>
                  </div>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Temizle
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== Hero Section ===== */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 text-white py-16 pt-20 pb-24">
        {/* Decorative blurred circles */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-300 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          {/* Label pill */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-yellow-300" />
            <span className="text-sm font-medium text-white/90">Şeffaflık &amp; Raporlama</span>
          </div>

          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="h-10 w-10" />
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              İlerleme Raporları
            </h1>
          </div>
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            Desteklediğiniz öğrencilerin 3 aylık akademik ve finansal ilerleme raporları
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-10">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <p className="text-3xl font-bold">{filteredReports.length}</p>
              <p className="text-sm text-blue-100">Toplam Rapor</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <p className="text-3xl font-bold">
                {new Set(filteredReports.map((r) => r.studentName)).size}
              </p>
              <p className="text-sm text-blue-100">Öğrenci</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-blue-100">Ort. GPA</p>
            </div>
          </div>

          {/* Hero Search Bar */}
          <div ref={heroSearchRef} className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rapor veya öğrenci ara..."
              className="w-full pl-12 pr-24 py-3.5 bg-white/95 backdrop-blur-sm text-gray-900 rounded-2xl shadow-xl shadow-black/10 border-0 focus:outline-none focus:ring-4 focus:ring-white/30 placeholder:text-gray-400 text-base"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-16 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5">
              <Search className="h-4 w-4" />
              Ara
            </button>
          </div>

          {/* Quarter Filter Pills in Hero */}
          <div className="max-w-xl mx-auto mt-4 flex items-center justify-center gap-2 flex-wrap">
            <span className="text-blue-200 text-xs font-medium">
              <Hash className="h-3 w-3 inline mr-0.5" />
              Dönem:
            </span>
            {ALL_QUARTERS.filter((q) => q !== 'all').map((q) => (
              <button
                key={q}
                onClick={() => setSelectedQuarter(q === selectedQuarter ? 'all' : q)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-all duration-200',
                  selectedQuarter === q
                    ? 'bg-white text-blue-700 shadow-md'
                    : 'bg-white/20 text-white/90 hover:bg-white/30 border border-white/20'
                )}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full">
            <path
              d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z"
              className="fill-gray-50"
            />
          </svg>
        </div>
      </div>

      {/* ===== Main Content ===== */}
      <div className="container mx-auto px-4 py-8 -mt-6 relative z-10 flex-1">
        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className="text-sm text-gray-500">Filtreler:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                &quot;{searchQuery}&quot;
                <button onClick={clearSearch} className="hover:text-blue-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedQuarter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                {selectedQuarter}
                <button onClick={() => setSelectedQuarter('all')} className="hover:text-blue-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="text-xs text-red-500 hover:text-red-700 font-medium ml-1"
            >
              Tümünü Temizle
            </button>
          </div>
        )}

        {/* Demo Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-center gap-3">
          <span className="text-amber-600 font-bold text-lg">⚠️</span>
          <p className="text-amber-800 text-sm font-medium">{t('common.demoReports')}</p>
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
                PDF İndir
              </Button>
            </div>
            <QuarterlyReport {...mockQuarterlyReport} />
          </div>

          {/* Report List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Tüm Raporlar</h2>
              <span className="text-sm text-gray-500">{filteredReports.length} rapor</span>
            </div>

            {filteredReports.length > 0 ? (
              <ProgressReportsList reports={filteredReports} />
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                <Search className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Sonuç bulunamadı</p>
                <p className="text-gray-400 text-sm mt-1">Farklı anahtar kelimeler deneyin</p>
                <button
                  onClick={clearAllFilters}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Filtreleri Temizle
                </button>
              </div>
            )}

            {/* Info Box */}
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Otomatik Raporlama</h4>
                  <p className="text-sm text-blue-700">
                    Her 3 ayda bir, desteklediğiniz öğrencinin akademik performansı, finansal durumu
                    ve önemli gelişmeleri hakkında detaylı rapor alırsınız.
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
                    <h4 className="font-semibold text-gray-900">Toplu İndirme</h4>
                    <p className="text-sm text-gray-500">Tüm raporları tek PDF olarak indirin</p>
                  </div>
                </div>
                <Button onClick={handleDownloadAll} className="gap-2 bg-green-600 hover:bg-green-700">
                  <Download className="h-4 w-4" />
                  Tümü İndir
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Footer ===== */}
      <Footer />
    </div>
  );
}
