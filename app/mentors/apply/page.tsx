'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, Building2, User, ArrowLeft, CheckCircle2, Mail, Phone, MapPin, Briefcase, Search, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/lib/i18n/context';
import MobileHeader from '@/components/MobileHeader';

const allCountries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
    "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
    "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon",
    "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
    "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador",
    "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France",
    "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
    "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
    "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo",
    "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania",
    "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius",
    "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia",
    "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
    "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland",
    "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent", "Samoa", "San Marino",
    "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands",
    "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland",
    "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Türkiye",
    "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu",
    "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

export default function MentorApplyPage() {
    const { t } = useTranslation();
    const router = useRouter();

    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        country: '',
        jobTitle: '',
        experienceYears: '',
    });
    const [mentorType, setMentorType] = useState<'corporate' | 'individual' | null>(null);
    const [whyText, setWhyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);

    // Filter countries based on search input
    const filteredCountries = useMemo(() => {
        if (!formData.country) return allCountries;
        return allCountries.filter(country =>
            country.toLowerCase().includes(formData.country.toLowerCase())
        );
    }, [formData.country]);


    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const isFormValid = () => {
        return (
            formData.firstName.trim() !== '' &&
            formData.lastName.trim() !== '' &&
            formData.email.trim() !== '' &&
            formData.phone.trim() !== '' &&
            formData.country !== '' &&
            formData.jobTitle.trim() !== '' &&
            formData.experienceYears !== '' &&
            mentorType !== null &&
            whyText.length >= 100
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid()) return;

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/mentors/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    country: formData.country,
                    jobTitle: formData.jobTitle,
                    experienceYears: formData.experienceYears,
                    mentorType,
                    whyText,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setIsSubmitted(true);
            } else {
                alert(data.error?.message || 'Bir hata oluştu, lütfen tekrar deneyin.');
            }
        } catch {
            alert('Bağlantı hatası. Lütfen tekrar deneyin.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
                <MobileHeader transparent backHref="/mentors" />
                <div className="container mx-auto px-4 py-16 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="h-10 w-10 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            {t('mentorApplication.successMessage')}
                        </h1>
                        <Link href="/mentors">
                            <Button variant="outline" className="mt-4">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {t('common.back')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
            <MobileHeader transparent backHref="/mentors" />

            {/* Hero */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-12 -mt-14 pt-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-3xl font-bold mb-2">{t('mentorApplication.title')}</h1>
                    <p className="text-indigo-100">{t('mentorApplication.subtitle')}</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">

                    {/* Personal Information */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            {t('mentorApplication.personalInfo') || 'Kişisel Bilgiler'}
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="firstName">{t('mentorApplication.firstName') || 'Ad'} *</Label>
                                <Input
                                    id="firstName"
                                    value={formData.firstName}
                                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                                    placeholder={t('mentorApplication.firstNamePlaceholder') || 'Adınız'}
                                    className="mt-1"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="lastName">{t('mentorApplication.lastName') || 'Soyad'} *</Label>
                                <Input
                                    id="lastName"
                                    value={formData.lastName}
                                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                                    placeholder={t('mentorApplication.lastNamePlaceholder') || 'Soyadınız'}
                                    className="mt-1"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="email">{t('mentorApplication.email') || 'E-posta'} *</Label>
                                <div className="relative mt-1">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        placeholder="ornek@email.com"
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="phone">{t('mentorApplication.phone') || 'Telefon'} *</Label>
                                <div className="relative mt-1">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        placeholder="+90 5XX XXX XX XX"
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <Label htmlFor="country">{t('mentorApplication.country') || 'Ülke'} *</Label>
                                <div className="relative mt-1">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                                    <Input
                                        id="countrySearch"
                                        type="text"
                                        value={formData.country}
                                        onChange={(e) => {
                                            handleInputChange('country', e.target.value);
                                            setCountryDropdownOpen(true);
                                        }}
                                        onFocus={() => setCountryDropdownOpen(true)}
                                        placeholder={t('mentorApplication.selectCountry') || 'Ülke seçin veya yazın...'}
                                        className="pl-10 pr-10"
                                        autoComplete="off"
                                    />
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    {countryDropdownOpen && (
                                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                            {filteredCountries.length > 0 ? (
                                                filteredCountries.map((country: string) => (
                                                    <button
                                                        key={country}
                                                        type="button"
                                                        className="w-full px-4 py-2 text-left hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none text-sm"
                                                        onClick={() => {
                                                            handleInputChange('country', country);
                                                            setCountryDropdownOpen(false);
                                                        }}
                                                    >
                                                        {country}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-4 py-2 text-sm text-gray-500">
                                                    {t('common.noResults') || 'Sonuç bulunamadı'}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Professional Information */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            {t('mentorApplication.professionalInfo') || 'Profesyonel Bilgiler'}
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="jobTitle">{t('mentorApplication.jobTitle') || 'Güncel İş Pozisyonu'} *</Label>
                                <div className="relative mt-1">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="jobTitle"
                                        value={formData.jobTitle}
                                        onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                                        placeholder={t('mentorApplication.jobTitlePlaceholder') || 'Örn: Yazılım Mühendisi'}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="experienceYears">{t('mentorApplication.experienceYears') || 'Deneyim Yılı'} *</Label>
                                <Select value={formData.experienceYears} onValueChange={(value) => handleInputChange('experienceYears', value)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder={t('mentorApplication.selectExperience') || 'Deneyim seçin'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0-2">0-2 {t('mentorApplication.years') || 'yıl'}</SelectItem>
                                        <SelectItem value="3-5">3-5 {t('mentorApplication.years') || 'yıl'}</SelectItem>
                                        <SelectItem value="6-10">6-10 {t('mentorApplication.years') || 'yıl'}</SelectItem>
                                        <SelectItem value="11-15">11-15 {t('mentorApplication.years') || 'yıl'}</SelectItem>
                                        <SelectItem value="15+">15+ {t('mentorApplication.years') || 'yıl'}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Mentor Type Selection */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            {t('mentorApplication.mentorType')}
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setMentorType('corporate')}
                                className={`p-6 rounded-xl border-2 text-left transition-all ${mentorType === 'corporate'
                                    ? 'border-indigo-600 bg-indigo-50'
                                    : 'border-gray-200 hover:border-indigo-300'
                                    }`}
                            >
                                <Building2 className={`h-8 w-8 mb-3 ${mentorType === 'corporate' ? 'text-indigo-600' : 'text-gray-400'}`} />
                                <h3 className="font-semibold text-gray-900">{t('mentorApplication.corporate')}</h3>
                                <p className="text-sm text-gray-500 mt-1">{t('mentorApplication.corporateDesc')}</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setMentorType('individual')}
                                className={`p-6 rounded-xl border-2 text-left transition-all ${mentorType === 'individual'
                                    ? 'border-indigo-600 bg-indigo-50'
                                    : 'border-gray-200 hover:border-indigo-300'
                                    }`}
                            >
                                <User className={`h-8 w-8 mb-3 ${mentorType === 'individual' ? 'text-indigo-600' : 'text-gray-400'}`} />
                                <h3 className="font-semibold text-gray-900">{t('mentorApplication.individual')}</h3>
                                <p className="text-sm text-gray-500 mt-1">{t('mentorApplication.individualDesc')}</p>
                            </button>
                        </div>
                    </div>

                    {/* Why Question */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <label className="block text-lg font-semibold text-gray-900 mb-2">
                            {t('mentorApplication.whyQuestion')}
                        </label>
                        <Textarea
                            value={whyText}
                            onChange={(e) => setWhyText(e.target.value)}
                            placeholder={t('mentorApplication.whyPlaceholder')}
                            rows={6}
                            className="w-full"
                        />
                        <p className={`text-sm mt-2 ${whyText.length < 100 ? 'text-red-500' : 'text-green-600'}`}>
                            {whyText.length}/100 {t('common.characters') || 'karakter'}
                        </p>
                    </div>

                    {/* Submit */}
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={!isFormValid() || isSubmitting}
                    >
                        {isSubmitting ? t('mentorApplication.submitting') : t('mentorApplication.submitApplication')}
                    </Button>
                </form>
            </div>
        </div>
    );
}
