import React, { useEffect, useState } from 'react';
import { Toaster, toast }             from 'react-hot-toast';
import api                             from '../../api';

/* ───────────────── helpers ───────────────── */
const fetchProfile = () => api.get('/api/users/profile').then(r => r.data);
const saveProfile  = p   => api.put('/api/users/profile', p).then(r => r.data);

/* ───────────────── component ─────────────── */
export default function SettingProfile() {
  const [me,   setMe]   = useState(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    jobTitle: '',
    userType: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile()
      .then((u) => {
        setMe(u);
        setForm(f => ({
          ...f,
          firstName : u.firstName,
          lastName  : u.lastName,
          email     : u.email,
          jobTitle  : u.jobTitle ?? '',
          userType  : u.userType ?? 'Customer',
        }));
      })
      .catch(() => toast.error('Unable to load profile'));
  }, []);

  if (!me) return <p className="text-sm text-gray-500 px-4 py-6">Loading…</p>;

  const change = key => e => setForm(f => ({ ...f, [key]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      firstName: form.firstName.trim(),
      lastName : form.lastName.trim(),
      email    : form.email.trim(),
      jobTitle : form.jobTitle.trim(),
      userType : form.userType,
    };
    try {
      const updated = await saveProfile(payload);
      setMe(updated);
      toast.success('Profile updated successfully ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };
  /* ───────── JSX ───────── */
  return (
    <>
      <Toaster position="top-right" />
      <form onSubmit={submit} className="space-y-10">

        <SectionHeader
          title="Business Information"
          desc="Edit general information about your business"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input  label="Business Name"     defaultValue="Algomian Technologies" readOnly />
          <Select label="Business Industry"
                  disabled
                  defaultValue="Laptops & Electronics"
                  options={['Laptops & Electronics','Fashion','Groceries']} />
          <Input  label="Business Email" type="email"
                  defaultValue="algomiantechnologies@gmail.com" readOnly />
          <Input  label="Business Phone" type="tel"
                  defaultValue="+2348123435668" readOnly />
        </div>

        <SectionHeader
          className="pt-4"
          title="Personal Information"
          desc="Edit administrative information about your business"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="First name" value={form.firstName} onChange={change('firstName')} />
          <Input label="Last name"  value={form.lastName}  onChange={change('lastName')}  />
          <Input label="Email"      type="email" value={form.email} onChange={change('email')} />
          <Input label="Job description" value={form.jobTitle} onChange={change('jobTitle')} />

            {/* User Type dropdown */}
            <Select
            label="User Type"
            value={form.userType}
            onChange={change('userType')}
            options={["Admin", "Manager", "SalesRep", "Customer"]}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-orange-600 text-white px-6 py-3
                     hover:bg-orange-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </>
  );
}

/* ───────── helpers / atoms ───────── */
const SectionHeader = ({ title, desc, className='' }) => (
  <header className={`space-y-1 ${className}`}>
    <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
    <p  className="text-sm text-gray-500">{desc}</p>
  </header>
);

const Input = ({ label, className='', ...rest }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input
      {...rest}
      className={`w-full rounded-md border-gray-300 shadow-sm
                  focus:ring-orange-500 focus:border-orange-500 ${className}`}
    />
  </div>
);

const Select = ({ label, options=[], className='', ...rest }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <select
      {...rest}
      className={`w-full rounded-md border-gray-300 shadow-sm
                  focus:ring-orange-500 focus:border-orange-500 ${className}`}
    >
      <option value="">— choose —</option>
      {options.map(o =>
        typeof o === 'string'
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.value} value={o.value}>{o.label}</option>
      )}
    </select>
  </div>
);
