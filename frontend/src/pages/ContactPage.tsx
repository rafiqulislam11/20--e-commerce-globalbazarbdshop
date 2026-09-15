import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { fetchApi } from '../services/api';
import { MapPin, Phone, Mail, MessageCircle, Send, CheckCircle2, Headphones, User, CreditCard } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { lang, t } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetchApi<{ success: boolean; message: string }>('/contact', {
        method: 'POST',
        body: JSON.stringify({ name, email, phone, subject, message })
      });
      if (res.success) {
        setSuccessMsg(res.message);
        setName('');
        setEmail('');
        setPhone('');
        setSubject('');
        setMessage('');
        setTimeout(() => setSuccessMsg(''), 6000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 select-none space-y-10">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
          <Headphones className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          {t('nav.contact')}
        </h1>
        <p className="text-xs text-gray-500">
          যেকোনো মতামত, জিজ্ঞাসা বা অভিযোগের জন্য সরাসরি যোগাযোগ করুন।
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Information & Channels (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">
              কাস্টমার কেয়ার ও সাপোর্ট অফিস
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">মালিক (Owner):</p>
                  <p className="text-gray-800 font-bold text-sm">Rafiqul Islam</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">হটলাইন নম্বর:</p>
                  <a href="tel:01310824987" className="text-teal-700 font-mono font-bold hover:underline text-sm">
                    01310-824987
                  </a>
                  <p className="text-[11px] text-gray-500">সকাল ৯টা - রাত ১০টা (প্রতিদিন)</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">হোয়াটসঅ্যাপ লাইভ চ্যাট:</p>
                  <a
                    href="https://wa.me/8801310824987"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-600 font-mono font-bold hover:underline text-sm flex items-center gap-1"
                  >
                    <span>01310-824987</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-sans">সরাসরি চ্যাট</span>
                  </a>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-700 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">বিকাশ ও নগদ নম্বর (bKash / Nagad):</p>
                  <p className="font-mono font-bold text-pink-700 text-sm">01930-279175</p>
                  <p className="text-[11px] text-gray-500">Send Money / Payment Support</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">অফিসিয়াল ইমেইল:</p>
                  <a href="mailto:globalbazarbdshop@gmail.com" className="text-gray-700 hover:text-teal-700 font-medium">
                    globalbazarbdshop@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">অফিসের ঠিকানা:</p>
                  <p className="text-gray-600 leading-relaxed">
                    SQ Color Master 3 No, Jamirdia, Hobirbari, Bhaluka, Mymensingh, Bangladesh
                    <span className="block text-gray-500 text-xs mt-1">
                      (এসকিউ কালার মাস্টার ৩ নং, জামিরদিয়া, হবিরবাড়ি, ভালুকা, ময়মনসিংহ)
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-gray-900 pb-2 border-b border-gray-100">
              আমাদের একটি বার্তা পাঠান (Send a Message)
            </h3>

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">আপনার নাম *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="পুরো নাম..."
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">ইমেইল এড্রেস *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="example@mail.com"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">মোবাইল নম্বর</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="০১৭১১-XXXXXX"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">বিষয় (Subject) *</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="যেমন: পণ্য সংক্রান্ত জিজ্ঞাসা"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">বিস্তারিত বার্তা *</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="আপনার বার্তাটি এখানে বিস্তারিত লিখুন..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'পাঠানো হচ্ছে...' : 'বার্তা পাঠান'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
