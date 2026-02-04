'use client';

import React, { useState } from 'react';
import {
    FileText,
    Download,
    Calendar,
    Filter,
    FileSpreadsheet,
    File,
    Mail,
    CheckCircle,
} from 'lucide-react';
import CorporateHeader from '@/components/corporate/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { mockStudents } from '@/lib/corporate/mock-data';

export default function ReportsPage() {
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [countryFilter, setCountryFilter] = useState('all');
    const [facultyFilter, setFacultyFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [autoReportEnabled, setAutoReportEnabled] = useState(true);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const filteredData = mockStudents.filter((student) => {
        const matchesCountry = countryFilter === 'all' || student.country === countryFilter;
        const matchesFaculty = facultyFilter === 'all' || student.faculty === facultyFilter;
        const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
        return matchesCountry && matchesFaculty && matchesStatus;
    });

    const totalDonations = filteredData.reduce((sum, s) => sum + s.total_donated, 0);
    const countries = [...new Set(mockStudents.map(s => s.country))];
    const faculties = [...new Set(mockStudents.map(s => s.faculty))];

    const exportCSV = () => {
        const headers = ['Ogrenci', 'Universite', 'Bolum', 'Ulke', 'Bagis', 'Hedef', 'Durum'];
        const rows = filteredData.map(s => [
            s.name,
            s.university,
            s.department,
            s.country,
            s.total_donated,
            s.goal_amount,
            s.status
        ]);

        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bagis-raporu-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const exportExcel = async () => {
        // In production, use xlsx library
        alert('Excel export (xlsx paketi ile) - Demo modunda CSV olarak indirilecek');
        exportCSV();
    };

    const exportPDF = () => {
        // In production, use jspdf library
        alert('PDF export (jspdf paketi ile) - Demo modunda hazirlanacak');
    };

    return (
        <div className="min-h-screen">
            <CorporateHeader
                title="Raporlar"
                subtitle="Bagis raporlarinizi goruntuleyın ve indirin"
            />

            <div className="p-6">
                {/* Filters */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filtreler
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                            <label className="text-sm text-gray-500 mb-1 block">Baslangic Tarihi</label>
                            <Input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-500 mb-1 block">Bitis Tarihi</label>
                            <Input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-500 mb-1 block">Ulke</label>
                            <Select value={countryFilter} onValueChange={setCountryFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Tumu" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tum Ulkeler</SelectItem>
                                    {countries.map(c => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm text-gray-500 mb-1 block">Fakulte</label>
                            <Select value={facultyFilter} onValueChange={setFacultyFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Tumu" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tum Fakulteler</SelectItem>
                                    {faculties.map(f => (
                                        <SelectItem key={f} value={f}>{f}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm text-gray-500 mb-1 block">Durum</label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Tumu" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tum Durumlar</SelectItem>
                                    <SelectItem value="active">Devam Ediyor</SelectItem>
                                    <SelectItem value="graduated">Mezun</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Export Options */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Rapor Indir</h3>
                            <p className="text-sm text-gray-500">
                                {filteredData.length} kayit • Toplam: {formatCurrency(totalDonations)}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button variant="outline" onClick={exportCSV} className="gap-2">
                                <FileText className="h-4 w-4" />
                                CSV
                            </Button>
                            <Button variant="outline" onClick={exportExcel} className="gap-2">
                                <FileSpreadsheet className="h-4 w-4" />
                                Excel
                            </Button>
                            <Button variant="outline" onClick={exportPDF} className="gap-2">
                                <File className="h-4 w-4" />
                                PDF (Vergi Makbuzu)
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Auto Report Settings */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6 border border-blue-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <Mail className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Otomatik Aylik Rapor</h3>
                                <p className="text-sm text-gray-600">Her ayin 1inde e-posta ile rapor alin</p>
                            </div>
                        </div>
                        <Button
                            variant={autoReportEnabled ? 'default' : 'outline'}
                            onClick={() => setAutoReportEnabled(!autoReportEnabled)}
                            className="gap-2"
                        >
                            {autoReportEnabled && <CheckCircle className="h-4 w-4" />}
                            {autoReportEnabled ? 'Aktif' : 'Etkinlestir'}
                        </Button>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ogrenci</TableHead>
                                <TableHead>Universite</TableHead>
                                <TableHead>Bolum</TableHead>
                                <TableHead>Ulke</TableHead>
                                <TableHead className="text-right">Bagis</TableHead>
                                <TableHead className="text-right">Hedef</TableHead>
                                <TableHead>Durum</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell className="font-medium">{student.name}</TableCell>
                                    <TableCell>{student.university}</TableCell>
                                    <TableCell>{student.department}</TableCell>
                                    <TableCell>{student.country}</TableCell>
                                    <TableCell className="text-right font-medium text-green-600">
                                        {formatCurrency(student.total_donated)}
                                    </TableCell>
                                    <TableCell className="text-right text-gray-500">
                                        {formatCurrency(student.goal_amount)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={
                                            student.status === 'active' ? 'bg-green-100 text-green-700' :
                                                student.status === 'graduated' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-red-100 text-red-700'
                                        }>
                                            {student.status === 'active' ? 'Devam' : student.status === 'graduated' ? 'Mezun' : 'Ayrildi'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
