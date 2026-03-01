'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '../../components/layout/AppLayout';
import { useCurrency } from '../../context/CurrencyContext';
import api from '../../lib/api';

// Import newly separated components
import ProfileSidebar from '../../app/profile/ProfileSidebar';
import AccountInformation from '../../app/profile/AccountInformation';
import CurrencyPreference from '../../app/profile/CurrencyPreference';
import ActiveSession from '../../app/profile/ActiveSession';
import DangerZone from '../../app/profile/DangerZone';
import PlaceholderSection from '../../app/profile/PlaceholderSection';
import BillingSection from '../../app/profile/BillingSection';

const SECTIONS = [
  { label: 'Account',       icon: '👤' },
  { label: 'Notifications', icon: '🔔' },
  { label: 'Security',      icon: '🔒' },
  { label: 'Billing',       icon: '💳' },
];

export default function ProfilePage() {
  const router = useRouter();
  const { currency, setCurrencyCode } = useCurrency();

  // State
  const [user, setUser] = useState(null);
  const [saved, setSaved] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [currencySaved, setCurrencySaved] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', currentPassword: '', newPassword: '' });
  const [activeSection, setActiveSection] = useState('Account');
  const [pendingCode, setPendingCode] = useState(currency.code);

  // Sync pending code
  useEffect(() => { setPendingCode(currency.code); }, [currency.code]);

  // Load user
  useEffect(() => {
    try {
      const stored = localStorage.getItem('stockenza_user');
      if (stored) {
        const u = JSON.parse(stored);
        setUser(u);
        setForm({ name: u.name || '', email: u.email || '', currentPassword: '', newPassword: '' });
      }
    } catch {}
  }, []);

  // Handlers
  const handleSave = async (e) => {
    e.preventDefault();
    setProfileError('');
    try {
      const token = localStorage.getItem('stockenza_token');
      const payload = { name: form.name };
      if (form.currentPassword || form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword     = form.newPassword;
      }
      const { data } = await api.put('/auth/profile', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Sync localStorage with updated name
      const stored = JSON.parse(localStorage.getItem('stockenza_user') || '{}');
      const updated = { ...stored, name: data.name };
      localStorage.setItem('stockenza_user', JSON.stringify(updated));
      setUser(updated);
      // Clear password fields
      setForm(f => ({ ...f, currentPassword: '', newPassword: '' }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Could not update profile.');
    }
  };

  const handleCurrencySave = () => {
    setCurrencyCode(pendingCode);
    setCurrencySaved(true);
    setTimeout(() => setCurrencySaved(false), 2500);
  };

  const handleLogout = () => {
    localStorage.removeItem('stockenza_token');
    localStorage.removeItem('stockenza_user');
    router.push('/login');
  };

  const handleResetData = async () => {
    try {
      await api.delete('/auth/reset-data');
    } catch (err) {
      alert(err.response?.data?.message || 'Could not reset business data. Please try again.');
      throw err; // re-throw so DangerZone knows it failed
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Profile</h1>
        <p className="text-sm text-zinc-600 mt-0.5">Manage your account and preferences</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        
        <ProfileSidebar 
          user={user}
          initials={initials}
          currency={currency}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          sections={SECTIONS}
        />

        <div className="lg:col-span-3 space-y-5">
          {activeSection === 'Account' ? (
            <>
              <AccountInformation 
                form={form} 
                setForm={setForm} 
                onSave={handleSave} 
                saved={saved}
                error={profileError}
              />
              <CurrencyPreference 
                currency={currency}
                pendingCode={pendingCode}
                setPendingCode={setPendingCode}
                onSave={handleCurrencySave}
                saved={currencySaved}
              />
              <ActiveSession user={user} />
              <DangerZone onLogout={handleLogout} onResetData={handleResetData} />
            </>
          ) : activeSection === 'Security' ? (
            <DangerZone onLogout={handleLogout} onResetData={handleResetData} />
          ) : activeSection === 'Billing' ? (
            <BillingSection />
          ) : (
            <PlaceholderSection activeSection={activeSection} sections={SECTIONS} />
          )}
        </div>
      </div>
    </AppLayout>
  );
}
