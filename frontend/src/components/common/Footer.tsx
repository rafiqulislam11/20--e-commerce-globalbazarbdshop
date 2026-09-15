import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageCircle, User } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { lang, t } = useLanguage();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300 pt-14 pb-20 lg:pb-12 border-t border-gray-800 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 pb-12 border-b border-gray-800">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-sky-500 flex items-center justify-center text-white font-black text-xl shadow-lg">
                GB
              </div>
              <div>
                <span className="font-extrabold text-xl text-white tracking-tight">GLOBAL BAZAR BD</span>
                <p className="text-xs text-teal-400 font-medium">{t('brand.tagline')}</p>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              {lang === 'bn'
                ? 'গ্লোবাল বাজার বিডি শপ বাংলাদেশের বিশ্বস্ত অনলাইন মার্কেটপ্লেস। আমরা সুলভ মূল্যে শতভাগ আসল পণ্য এবং সারা দেশে দ্রুত ও নিরাপদ হোম ডেলিভারি নিশ্চিত করি।'
                : 'Global Bazar BD Shop is Bangladesh’s trusted destination for authentic electronics, lifestyle, fashion and grocery essentials delivered safely to your doorstep.'}
            </p>

            <div className="space-y-2 text-xs text-gray-400 pt-2">
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-teal-400 shrink-0" />
                <span>মালিক (Owner): <strong className="text-gray-200">Rafiqul Islam</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <a href="tel:01310824987" className="hover:text-white transition-colors font-mono">
                  হেল্পলাইন: <strong>01310-824987</strong>
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="https://wa.me/8801310824987" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors font-mono">
                  হোয়াটসঅ্যাপ: <strong>01310-824987</strong>
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <a href="mailto:globalbazarbdshop@gmail.com" className="hover:text-white transition-colors">
                  globalbazarbdshop@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
                <span>SQ Color Master 3 No, Jamirdia, Hobirbari, Bhaluka, Mymensingh, Bangladesh</span>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <p className="text-sm font-bold text-white uppercase tracking-wider">
              {lang === 'bn' ? 'দ্রুত লিংক' : 'Quick Links'}
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-teal-400 transition-colors cursor-pointer">
                  {t('nav.shop')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'flash_sale=true')} className="hover:text-teal-400 transition-colors cursor-pointer">
                  {t('nav.flash_sale')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tracking')} className="hover:text-teal-400 transition-colors cursor-pointer">
                  {t('nav.track_order')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('blog')} className="hover:text-teal-400 transition-colors cursor-pointer">
                  {t('nav.blog')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-teal-400 transition-colors cursor-pointer">
                  {t('nav.contact')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Policies */}
          <div className="space-y-3">
            <p className="text-sm font-bold text-white uppercase tracking-wider">
              {lang === 'bn' ? 'গ্রাহক সেবা ও নীতি' : 'Policies & Care'}
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('legal', 'return')} className="hover:text-teal-400 transition-colors cursor-pointer">
                  {lang === 'bn' ? 'রিটার্ন ও রিফান্ড নীতি' : 'Return & Refund Policy'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('legal', 'shipping')} className="hover:text-teal-400 transition-colors cursor-pointer">
                  {lang === 'bn' ? 'ডেলিভারি ও শিপিং নীতি' : 'Shipping Policy'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('legal', 'privacy')} className="hover:text-teal-400 transition-colors cursor-pointer">
                  {lang === 'bn' ? 'প্রাইভেসি পলিসি' : 'Privacy Policy'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('legal', 'terms')} className="hover:text-teal-400 transition-colors cursor-pointer">
                  {lang === 'bn' ? 'ব্যবহারের শর্তাবলী' : 'Terms & Conditions'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('account')} className="hover:text-teal-400 transition-colors cursor-pointer">
                  {t('nav.account')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div className="space-y-3">
            <p className="text-sm font-bold text-white uppercase tracking-wider">
              {t('home.newsletter_title')}
            </p>
            <p className="text-xs text-gray-400">
              {t('home.newsletter_desc')}
            </p>
            <form onSubmit={handleNewsletter} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="আপনার ইমেইল ঠিকানা..."
                  required
                  className="w-full px-3 py-2 text-xs bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
              {subscribed && (
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t('home.subscribe_success')}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Section: Payment Methods & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div>
            <p>© 2026 Global Bazar BD Shop. {t('brand.all_rights_reserved')}</p>
          </div>

          {/* Bangladeshi Payment & Logistics Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-gray-400 font-medium">নিরাপদ পেমেন্ট পার্টনার:</span>
            <span className="px-2.5 py-1 bg-pink-900/60 text-pink-300 rounded font-bold text-[11px] border border-pink-700/50 flex items-center gap-1">
              <span>bKash</span>
              <span className="font-mono text-[10px] text-pink-200">(01930-279175)</span>
            </span>
            <span className="px-2.5 py-1 bg-orange-900/60 text-orange-300 rounded font-bold text-[11px] border border-orange-700/50 flex items-center gap-1">
              <span>Nagad</span>
              <span className="font-mono text-[10px] text-orange-200">(01930-279175)</span>
            </span>
            <span className="px-2.5 py-1 bg-blue-900/60 text-blue-300 rounded font-bold text-[11px] border border-blue-700/50">
              Visa / Card
            </span>
            <span className="px-2.5 py-1 bg-emerald-900/60 text-emerald-300 rounded font-bold text-[11px] border border-emerald-700/50">
              Cash on Delivery
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
