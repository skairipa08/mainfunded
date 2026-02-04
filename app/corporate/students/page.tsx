'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, GraduationCap, ChevronRight } from 'lucide-react';
import CorporateHeader from '@/components/corporate/Header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { mockStudents } from '@/lib/corporate/mock-data';
import { Progress } from '@/components/ui/progress';

export default function StudentsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [facultyFilter, setFacultyFilter] = useState('all');

    const filteredStudents = mockStudents.filter((student) => {
        const matchesSearch =
            student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.department.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
            statusFilter === 'all' || student.status === statusFilter;

        const matchesFaculty =
            facultyFilter === 'all' || student.faculty === facultyFilter;

        return matchesSearch && matchesStatus && matchesFaculty;
    });

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Aktif</Badge>;
            case 'graduated':
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Mezun</Badge>;
            case 'dropped':
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Ayrildi</Badge>;
            default:
                return null;
        }
    };

    const faculties = [...new Set(mockStudents.map((s) => s.faculty))];

    return (
        <div className="min-h-screen">
            <CorporateHeader
                title="Ogrenciler"
                subtitle="Desteklediginiz ogrencileri takip edin"
            />

            <div className="p-6">
                {/* Filters */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Ogrenci, universite veya bolum ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-40">
                                <SelectValue placeholder="Durum" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tum Durumlar</SelectItem>
                                <SelectItem value="active">Aktif</SelectItem>
                                <SelectItem value="graduated">Mezun</SelectItem>
                                <SelectItem value="dropped">Ayrildi</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={facultyFilter} onValueChange={setFacultyFilter}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Fakulte" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tum Fakulteler</SelectItem>
                                {faculties.map((faculty) => (
                                    <SelectItem key={faculty} value={faculty}>
                                        {faculty}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Students Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStudents.map((student) => (
                        <Link
                            key={student.id}
                            href={`/corporate/students/${student.id}`}
                            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <GraduationCap className="h-8 w-8 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-gray-900 truncate">
                                            {student.name}
                                        </h3>
                                        {getStatusBadge(student.status)}
                                    </div>
                                    <p className="text-sm text-gray-500 truncate mt-1">
                                        {student.university}
                                    </p>
                                    <p className="text-sm text-gray-400 truncate">
                                        {student.department}
                                    </p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-600 transition-colors" />
                            </div>

                            <div className="mt-4">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-500">Ilerleme</span>
                                    <span className="font-medium text-gray-900">
                                        {Math.round((student.total_donated / student.goal_amount) * 100)}%
                                    </span>
                                </div>
                                <Progress
                                    value={(student.total_donated / student.goal_amount) * 100}
                                    className="h-2"
                                />
                                <div className="flex justify-between text-sm mt-2 text-gray-500">
                                    <span>{formatCurrency(student.total_donated)}</span>
                                    <span>{formatCurrency(student.goal_amount)}</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <span>Hedef: {student.target_year}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <span>{student.country}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {filteredStudents.length === 0 && (
                    <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
                        <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Ogrenci Bulunamadi
                        </h3>
                        <p className="text-gray-500">
                            Arama kriterlerinize uygun ogrenci bulunamadi.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
