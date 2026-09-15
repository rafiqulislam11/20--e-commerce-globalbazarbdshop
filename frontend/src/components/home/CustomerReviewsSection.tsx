import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Star, CheckCircle, Quote } from 'lucide-react';

export const CustomerReviewsSection: React.FC = () => {
  const { lang, t } = useLanguage();

  const reviews = [
    {
      name: 'কামরুল হাসান',
      location: 'ধানমন্ডি, ঢাকা',
      rating: 5,
      comment: 'ওয়ালটনের ৪৩ ইঞ্চি টিভিটা অবিশ্বাস্য সুন্দর! ৪কে পিকচার কোয়ালিটি এবং সাউন্ড অনেক ক্লিয়ার। মাত্র ২ দিনে ধানমন্ডিতে হোম ডেলিভারি পেয়েছি। সম্পূর্ণ অক্ষত প্যাকেজিং ছিল।',
      productName: 'Walton Smart LED TV 43" 4K',
      date: '১০ সেপ্টেম্বর ২০২৬'
    },
    {
      name: 'মাহবুব আলম',
      location: 'জিইসি, চট্টগ্রাম',
      rating: 5,
      comment: 'অরিজিনাল রেডমি নোট ১৩ প্রো পেয়েছি। ২০০ মেগাপিক্সেল ক্যামেরা অসাধারণ! অফিসিয়াল বিটিআরসি সিল ও ওয়ারেন্টি কার্ড পেয়ে নিশ্চিন্ত হলাম। ধন্যবাদ গ্লোবাল বাজার বিডি!',
      productName: 'Xiaomi Redmi Note 13 Pro',
      date: '১২ সেপ্টেম্বর ২০২৬'
    },
    {
      name: 'সাদিয়া তাসনিম',
      location: 'উত্তরা, ঢাকা',
      rating: 5,
      comment: 'আড়ং জামদানি সিল্ক শাড়ি ও পাঞ্জাবির কাপড়টা অসম্ভব আরামদায়ক। ছবির চেয়েও বাস্তবে দেখতে বেশি সুন্দর। সাইজ ও কোয়ালিটি একদম নিখুঁত। নিঃসন্দেহে বারবার শপিং করব।',
      productName: 'Aarong Silk Saree & Panjabi',
      date: '১৪ সেপ্টেম্বর ২০২৬'
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 select-none">
      <div className="text-center max-w-xl mx-auto mb-8">
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
          {t('home.customer_reviews')}
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          {lang === 'bn'
            ? 'সারা দেশের হাজারো সন্তুষ্ট গ্রাহকের আসল প্রতিক্রিয়া ও মতামত'
            : 'Genuine feedback from thousands of satisfied shoppers nationwide'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((r, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative group"
          >
            <Quote className="absolute top-4 right-4 w-8 h-8 text-teal-100 group-hover:text-teal-200 transition-colors" />

            <div className="space-y-3 relative z-10">
              {/* Stars */}
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(r.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>

              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic">
                "{r.comment}"
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-gray-900">{r.name}</h4>
                <p className="text-[11px] text-gray-400">{r.location}</p>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                <span>{lang === 'bn' ? 'যাচাইকৃত ক্রেতা' : 'Verified'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
