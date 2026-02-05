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
import { useTranslation } from '@/lib/i18n/context';

export default function SettingsPage() {
    const { t } = useTranslation();
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
                return <Badge className="bg-purple-100 text-purple-700">{t('corporate.settings.paymentAdmin')}</Badge>;
            case 'editor':
                return <Badge className="bg-blue-100 text-blue-700">{t('corporate.settings.editor')}</Badge>;
            case 'viewer':
                return <Badge className="bg-gray-100 text-gray-700">{t('corporate.settings.viewer')}</Badge>;
            default:
                return null;
        }
    };

    // Logo upload handler
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert(t('corporate.settings.fileSizeError'));
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
            alert(t('corporate.settings.enterEmail'));
            return;
        }
        alert(`${inviteEmail} ${t('corporate.settings.inviteSent')} ${inviteRole}`);
        setShowInviteModal(false);
        setInviteEmail('');
    };

    // Password change handler
    const handlePasswordChange = () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert(t('corporate.settings.fillAllFields'));
            return;
        }
        if (newPassword !== confirmPassword) {
            alert(t('corporate.settings.passwordsNotMatch'));
            return;
        }
        if (newPassword.length < 8) {
            alert(t('corporate.settings.passwordMinLength'));
            return;
        }
        alert(t('corporate.settings.passwordChanged'));
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    // 2FA handler
    const handle2FAEnable = () => {
        setTwoFactorEnabled(true);
        setShow2FAModal(false);
        alert(t('corporate.settings.twoFAEnabled'));
    };

    const copySecretKey = () => {
        navigator.clipboard.writeText('JBSWY3DPEHPK3PXP');
        setQrCodeCopied(true);
        setTimeout(() => setQrCodeCopied(false), 2000);
    };

    return (
        <div className="min-h-screen">
            <CorporateHeader
                title={t('corporate.settings.title')}
                subtitle={t('corporate.settings.subtitle')}
            />

            <div className="p-6 max-w-4xl">
                {/* Company Settings */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        {t('corporate.settings.companyInfo')}
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
                                    {t('corporate.settings.uploadLogo')}
                                </Button>
                                <p className="text-xs text-gray-500 mt-1">{t('corporate.settings.logoFormat')}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>{t('corporate.settings.companyName')}</Label>
                                <Input
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label>{t('corporate.settings.subscription')}</Label>
                                <div className="mt-1 flex items-center gap-2">
                                    <Badge className="bg-purple-100 text-purple-700 text-sm py-1">
                                        Enterprise
                                    </Badge>
                                    <span className="text-sm text-gray-500">{t('corporate.settings.allFeaturesActive')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Settings */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        {t('corporate.settings.profileSettings')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>{t('corporate.settings.fullName')}</Label>
                            <Input
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>{t('corporate.settings.email')}</Label>
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
                            {t('corporate.settings.teamMembers')}
                        </h3>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowInviteModal(true)}
                        >
                            <UserPlus className="h-4 w-4 mr-2" />
                            {t('corporate.settings.inviteMember')}
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
                                            <SelectItem value="viewer">{t('corporate.settings.viewer')}</SelectItem>
                                            <SelectItem value="editor">{t('corporate.settings.editor')}</SelectItem>
                                            <SelectItem value="payment_admin">{t('corporate.settings.paymentAdmin')}</SelectItem>
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
                        {t('corporate.settings.security')}
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <Key className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="font-medium text-gray-900">{t('corporate.settings.changePassword')}</p>
                                    <p className="text-sm text-gray-500">{t('corporate.settings.lastChanged')}</p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowPasswordModal(true)}
                            >
                                {t('corporate.settings.change')}
                            </Button>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3">
                                <Smartphone className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="font-medium text-gray-900">{t('corporate.settings.twoFactorAuth')}</p>
                                    <p className="text-sm text-gray-500">{t('corporate.settings.extraSecurity')}</p>
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
                                        {t('corporate.settings.active')}
                                    </>
                                ) : t('corporate.settings.enable')}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Notification Preferences */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        {t('corporate.settings.notificationPrefs')}
                    </h3>
                    <div className="space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <Checkbox defaultChecked />
                            <div>
                                <p className="font-medium text-gray-900">{t('corporate.settings.studentUpdates')}</p>
                                <p className="text-sm text-gray-500">{t('corporate.settings.studentUpdatesDesc')}</p>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <Checkbox defaultChecked />
                            <div>
                                <p className="font-medium text-gray-900">{t('corporate.settings.thankYouMessages')}</p>
                                <p className="text-sm text-gray-500">{t('corporate.settings.thankYouMessagesDesc')}</p>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <Checkbox defaultChecked />
                            <div>
                                <p className="font-medium text-gray-900">{t('corporate.settings.newCampaigns')}</p>
                                <p className="text-sm text-gray-500">{t('corporate.settings.newCampaignsDesc')}</p>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <Checkbox />
                            <div>
                                <p className="font-medium text-gray-900">{t('corporate.settings.monthlySummary')}</p>
                                <p className="text-sm text-gray-500">{t('corporate.settings.monthlySummaryDesc')}</p>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button size="lg" className="gap-2">
                        <Save className="h-5 w-5" />
                        {t('corporate.settings.saveChanges')}
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
                                {t('corporate.settings.inviteMember')}
                            </h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowInviteModal(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                            {t('corporate.settings.inviteDesc')}
                        </p>
                        <div className="space-y-4">
                            <div>
                                <Label>{t('corporate.settings.emailAddress')}</Label>
                                <Input
                                    type="email"
                                    placeholder={t('corporate.settings.emailPlaceholder')}
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label>{t('corporate.settings.role')}</Label>
                                <Select value={inviteRole} onValueChange={setInviteRole}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="viewer">{t('corporate.settings.viewerDesc')}</SelectItem>
                                        <SelectItem value="editor">{t('corporate.settings.editorDesc')}</SelectItem>
                                        <SelectItem value="payment_admin">{t('corporate.settings.paymentAdminDesc')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button variant="outline" className="flex-1" onClick={() => setShowInviteModal(false)}>
                                {t('corporate.settings.cancel')}
                            </Button>
                            <Button className="flex-1 gap-2" onClick={handleInvite}>
                                <Mail className="h-4 w-4" />
                                {t('corporate.settings.sendInvite')}
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
                                {t('corporate.settings.changePassword')}
                            </h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowPasswordModal(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <Label>{t('corporate.settings.currentPassword')}</Label>
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
                                <Label>{t('corporate.settings.newPassword')}</Label>
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="mt-1"
                                />
                                <p className="text-xs text-gray-500 mt-1">{t('corporate.settings.minChars')}</p>
                            </div>
                            <div>
                                <Label>{t('corporate.settings.confirmPassword')}</Label>
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
                                {t('corporate.settings.cancel')}
                            </Button>
                            <Button className="flex-1" onClick={handlePasswordChange}>
                                {t('corporate.settings.changePasswordBtn')}
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
                                {t('corporate.settings.twoFASetup')}
                            </h3>
                            <Button variant="ghost" size="icon" onClick={() => setShow2FAModal(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="text-center mb-6">
                            <div className="w-48 h-48 bg-gray-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
                                <div className="text-center">
                                    <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                    <p className="text-xs text-gray-500">{t('corporate.settings.qrCode')}</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                {t('corporate.settings.scanQR')}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <Label className="text-xs text-gray-500">{t('corporate.settings.secretKey')}</Label>
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
                                {t('corporate.settings.cancel')}
                            </Button>
                            <Button className="flex-1" onClick={handle2FAEnable}>
                                {t('corporate.settings.enable')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
