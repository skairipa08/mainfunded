'use client';

import React, { useState, useRef } from 'react';
import {
    Building2,
    Users,
    Bell,
    Shield,
    Key,
    Mail,
    Save,
    Upload,
    X,
    Eye,
    EyeOff,
    Smartphone,
    Check,
    Copy,
    UserPlus,
} from 'lucide-react';
import CorporateHeader from '@/components/corporate/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { mockCorporateAccount, mockCorporateUser } from '@/lib/corporate/mock-data';

export default function SettingsPage() {
    const [companyName, setCompanyName] = useState(mockCorporateAccount.company_name);
    const [userName, setUserName] = useState(mockCorporateUser.name);
    const [userEmail, setUserEmail] = useState(mockCorporateUser.email);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

    // Logo upload state
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Modal states
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [show2FAModal, setShow2FAModal] = useState(false);

    // Form states
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('viewer');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [qrCodeCopied, setQrCodeCopied] = useState(false);

    const teamMembers = [
        { name: 'Ahmet Yilmaz', email: 'admin@techventures.com', role: 'payment_admin' },
        { name: 'Zeynep Kara', email: 'zeynep@techventures.com', role: 'editor' },
        { name: 'Mehmet Demir', email: 'mehmet@techventures.com', role: 'viewer' },
    ];

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'payment_admin':
                return <Badge className="bg-purple-100 text-purple-700">Odeme Yetkilisi</Badge>;
            case 'editor':
                return <Badge className="bg-blue-100 text-blue-700">Duzenleyici</Badge>;
            case 'viewer':
                return <Badge className="bg-gray-100 text-gray-700">Izleyici</Badge>;
            default:
                return null;
        }
    };

    // Logo upload handler
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('Dosya boyutu 2MB\'dan kucuk olmalidir');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Invite handler
    const handleInvite = () => {
        if (!inviteEmail) {
            alert('Lutfen bir e-posta adresi girin');
            return;
        }
        alert(`${inviteEmail} adresine ${inviteRole} rolu ile davet gonderildi!`);
        setShowInviteModal(false);
        setInviteEmail('');
    };

    // Password change handler
    const handlePasswordChange = () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert('Lutfen tum alanlari doldurun');
            return;
        }
        if (newPassword !== confirmPassword) {
            alert('Yeni sifreler uyusmuyor');
            return;
        }
        if (newPassword.length < 8) {
            alert('Sifre en az 8 karakter olmalidir');
            return;
        }
        alert('Sifreniz basariyla degistirildi!');
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    // 2FA handler
    const handle2FAEnable = () => {
        setTwoFactorEnabled(true);
        setShow2FAModal(false);
        alert('Iki faktorlu dogrulama basariyla etkinlestirildi!');
    };

    const copySecretKey = () => {
        navigator.clipboard.writeText('JBSWY3DPEHPK3PXP');
        setQrCodeCopied(true);
        setTimeout(() => setQrCodeCopied(false), 2000);
    };

    return (
        <div className="min-h-screen">
            <CorporateHeader
                title="Ayarlar"
                subtitle="Hesap ve tercihlerinizi yonetin"
            />

            <div className="p-6 max-w-4xl">
                {/* Company Settings */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Sirket Bilgileri
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-6">
                            <div
                                className="w-20 h-20 bg-blue-100 rounded-xl flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <Building2 className="h-10 w-10 text-blue-600" />
                                )}
                            </div>
                            <div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleLogoUpload}
                                    accept="image/png,image/jpeg"
                                    className="hidden"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Logo Yukle
                                </Button>
                                <p className="text-xs text-gray-500 mt-1">PNG veya JPG, max 2MB</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Sirket Adi</Label>
                                <Input
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label>Abonelik</Label>
                                <div className="mt-1 flex items-center gap-2">
                                    <Badge className="bg-purple-100 text-purple-700 text-sm py-1">
                                        Enterprise
                                    </Badge>
                                    <span className="text-sm text-gray-500">Tum ozellikler aktif</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Settings */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Profil Ayarlari
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Ad Soyad</Label>
                            <Input
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>E-posta</Label>
                            <Input
                                type="email"
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                    </div>
                </div>

                {/* Team Members */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Takim Uyeleri
                        </h3>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowInviteModal(true)}
                        >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Uye Davet Et
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {teamMembers.map((member) => (
                            <div
                                key={member.email}
                                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                                        {member.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{member.name}</p>
                                        <p className="text-sm text-gray-500">{member.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {getRoleBadge(member.role)}
                                    <Select defaultValue={member.role}>
                                        <SelectTrigger className="w-36">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="viewer">Izleyici</SelectItem>
                                            <SelectItem value="editor">Duzenleyici</SelectItem>
                                            <SelectItem value="payment_admin">Odeme Yetkilisi</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Security */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Guvenlik
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <Key className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="font-medium text-gray-900">Sifre Degistir</p>
                                    <p className="text-sm text-gray-500">Son degistirilme: 30 gun once</p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowPasswordModal(true)}
                            >
                                Degistir
                            </Button>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3">
                                <Smartphone className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="font-medium text-gray-900">Iki Faktorlu Dogrulama (2FA)</p>
                                    <p className="text-sm text-gray-500">Ekstra guvenlik katmani</p>
                                </div>
                            </div>
                            <Button
                                variant={twoFactorEnabled ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => twoFactorEnabled ? setTwoFactorEnabled(false) : setShow2FAModal(true)}
                            >
                                {twoFactorEnabled ? (
                                    <>
                                        <Check className="h-4 w-4 mr-1" />
                                        Aktif
                                    </>
                                ) : 'Etkinlestir'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Notification Preferences */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Bildirim Tercihleri
                    </h3>
                    <div className="space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <Checkbox defaultChecked />
                            <div>
                                <p className="font-medium text-gray-900">Ogrenci Guncellemeleri</p>
                                <p className="text-sm text-gray-500">Ogrenci ilerlemesi hakkinda bildirimler</p>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <Checkbox defaultChecked />
                            <div>
                                <p className="font-medium text-gray-900">Tesekkur Mesajlari</p>
                                <p className="text-sm text-gray-500">Ogrencilerden gelen tesekkurler</p>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <Checkbox defaultChecked />
                            <div>
                                <p className="font-medium text-gray-900">Yeni Kampanyalar</p>
                                <p className="text-sm text-gray-500">Yeni kampanya onerileri</p>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <Checkbox />
                            <div>
                                <p className="font-medium text-gray-900">Aylik Ozet Raporu</p>
                                <p className="text-sm text-gray-500">Her ayin sonunda e-posta ile ozet</p>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button size="lg" className="gap-2">
                        <Save className="h-5 w-5" />
                        Degisiklikleri Kaydet
                    </Button>
                </div>
            </div>

            {/* Invite Member Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowInviteModal(false)} />
                    <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Mail className="h-5 w-5 text-blue-600" />
                                Uye Davet Et
                            </h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowInviteModal(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                            E-posta ile yeni bir takim uyesi davet edin.
                        </p>
                        <div className="space-y-4">
                            <div>
                                <Label>E-posta Adresi</Label>
                                <Input
                                    type="email"
                                    placeholder="ornek@sirket.com"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label>Rol</Label>
                                <Select value={inviteRole} onValueChange={setInviteRole}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="viewer">Izleyici - Sadece goruntuleyebilir</SelectItem>
                                        <SelectItem value="editor">Duzenleyici - Duzenleme yapabilir</SelectItem>
                                        <SelectItem value="payment_admin">Odeme Yetkilisi - Tam yetki</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button variant="outline" className="flex-1" onClick={() => setShowInviteModal(false)}>
                                Iptal
                            </Button>
                            <Button className="flex-1 gap-2" onClick={handleInvite}>
                                <Mail className="h-4 w-4" />
                                Davet Gonder
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowPasswordModal(false)} />
                    <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Key className="h-5 w-5 text-blue-600" />
                                Sifre Degistir
                            </h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowPasswordModal(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <Label>Mevcut Sifre</Label>
                                <div className="relative mt-1">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <Label>Yeni Sifre</Label>
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="mt-1"
                                />
                                <p className="text-xs text-gray-500 mt-1">En az 8 karakter</p>
                            </div>
                            <div>
                                <Label>Yeni Sifre (Tekrar)</Label>
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button variant="outline" className="flex-1" onClick={() => setShowPasswordModal(false)}>
                                Iptal
                            </Button>
                            <Button className="flex-1" onClick={handlePasswordChange}>
                                Sifreyi Degistir
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* 2FA Setup Modal */}
            {show2FAModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShow2FAModal(false)} />
                    <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Smartphone className="h-5 w-5 text-blue-600" />
                                2FA Kurulumu
                            </h3>
                            <Button variant="ghost" size="icon" onClick={() => setShow2FAModal(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="text-center mb-6">
                            <div className="w-48 h-48 bg-gray-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
                                <div className="text-center">
                                    <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                    <p className="text-xs text-gray-500">QR Kodu</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                Google Authenticator veya benzeri bir uygulama ile taratin
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <Label className="text-xs text-gray-500">Manuel Giris Icin Gizli Anahtar</Label>
                            <div className="flex items-center gap-2 mt-1">
                                <code className="flex-1 bg-white px-3 py-2 rounded border text-sm font-mono">
                                    JBSWY3DPEHPK3PXP
                                </code>
                                <Button variant="outline" size="icon" onClick={copySecretKey}>
                                    {qrCodeCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => setShow2FAModal(false)}>
                                Iptal
                            </Button>
                            <Button className="flex-1" onClick={handle2FAEnable}>
                                Etkinlestir
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
