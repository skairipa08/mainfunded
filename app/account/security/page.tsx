'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield, ShieldCheck, ShieldOff, Copy, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function MfaSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'status' | 'setup' | 'confirm' | 'done'>('status');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  // Load MFA status
  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/mfa/setup')
      .then((r) => r.json())
      .then((data) => {
        setMfaEnabled(data.mfa?.enabled ?? false);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status]);

  // Start MFA setup
  const startSetup = async () => {
    setProcessing(true);
    setError('');
    try {
      const res = await fetch('/api/mfa/setup', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Setup failed');
      setQrCode(data.qrCodeDataUrl);
      setSecret(data.secret);
      setBackupCodes(data.backupCodes);
      setStep('setup');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setProcessing(false);
    }
  };

  // Confirm setup
  const confirmSetup = async () => {
    setProcessing(true);
    setError('');
    try {
      const res = await fetch('/api/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'confirm' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      setMfaEnabled(true);
      setStep('done');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setProcessing(false);
    }
  };

  // Disable MFA
  const disableMfa = async () => {
    setProcessing(true);
    setError('');
    try {
      const res = await fetch('/api/mfa/verify', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to disable');
      setMfaEnabled(false);
      setStep('status');
      setToken('');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setProcessing(false);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopiedBackup(true);
    setTimeout(() => setCopiedBackup(false), 2000);
  };

  if (status === 'loading' || loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-7 w-7 text-emerald-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                İki Faktörlü Doğrulama (2FA)
              </h1>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* ─── Status View ──────────────────────────── */}
            {step === 'status' && (
              <div>
                <div className={`p-4 rounded-lg border mb-6 ${mfaEnabled ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="flex items-center gap-2">
                    {mfaEnabled ? (
                      <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <ShieldOff className="h-5 w-5 text-amber-600" />
                    )}
                    <span className={`font-medium ${mfaEnabled ? 'text-emerald-800' : 'text-amber-800'}`}>
                      {mfaEnabled ? '2FA Aktif' : '2FA Aktif Değil'}
                    </span>
                  </div>
                  <p className="text-sm mt-1 text-gray-600">
                    {mfaEnabled
                      ? 'Hesabınız iki faktörlü doğrulama ile korunmaktadır.'
                      : 'Hesabınızı daha güvenli hale getirmek için 2FA\'yı etkinleştirin.'}
                  </p>
                </div>

                {!mfaEnabled ? (
                  <Button onClick={startSetup} disabled={processing} className="w-full bg-emerald-600 hover:bg-emerald-700">
                    {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
                    2FA&apos;yı Etkinleştir
                  </Button>
                ) : (
                  <div>
                    <p className="text-sm text-gray-500 mb-3">
                      2FA&apos;yı devre dışı bırakmak için mevcut kodunuzu girin:
                    </p>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        inputMode="numeric"
                        maxLength={8}
                        placeholder="6 haneli kod"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={disableMfa} disabled={processing || token.length < 6} variant="destructive">
                        {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Devre Dışı Bırak'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── Setup View ──────────────────────────── */}
            {step === 'setup' && (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Google Authenticator veya benzer bir uygulama ile aşağıdaki QR kodu tarayın:
                </p>

                {qrCode && (
                  <div className="flex justify-center mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrCode} alt="MFA QR Code" className="w-48 h-48 border rounded-lg" />
                  </div>
                )}

                <details className="mb-4">
                  <summary className="text-sm text-emerald-600 cursor-pointer">Manuel giriş kodu</summary>
                  <code className="block mt-2 text-xs bg-gray-100 p-2 rounded break-all select-all">
                    {secret}
                  </code>
                </details>

                {/* Backup codes */}
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-amber-800">Yedek Kodlar</span>
                    <Button size="sm" variant="ghost" onClick={copyBackupCodes}>
                      {copiedBackup ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-amber-700 mb-2">
                    Bu kodları güvenli bir yere kaydedin. Her kod yalnızca bir kez kullanılabilir.
                  </p>
                  <div className="grid grid-cols-2 gap-1">
                    {backupCodes.map((code, i) => (
                      <code key={i} className="text-xs bg-white p-1 rounded text-center font-mono">
                        {code}
                      </code>
                    ))}
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-2">
                  Uygulamadaki 6 haneli kodu girerek kurulumu tamamlayın:
                </p>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={token}
                    onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 text-center text-lg tracking-widest font-mono"
                  />
                  <Button onClick={confirmSetup} disabled={processing || token.length !== 6} className="bg-emerald-600 hover:bg-emerald-700">
                    {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Onayla'}
                  </Button>
                </div>
              </div>
            )}

            {/* ─── Done View ───────────────────────────── */}
            {step === 'done' && (
              <div className="text-center">
                <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  2FA Başarıyla Etkinleştirildi!
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Hesabınız artık iki faktörlü doğrulama ile korunmaktadır.
                </p>
                <Button onClick={() => router.push('/account')} className="bg-emerald-600 hover:bg-emerald-700">
                  Hesabıma Dön
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
