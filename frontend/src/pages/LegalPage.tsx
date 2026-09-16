import React, { useState } from 'react';
import { ShieldCheck, Truck, RotateCcw, FileText } from 'lucide-react';

interface LegalPageProps {
  initialTab?: string;
  onNavigate: (page: string, param?: string) => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ initialTab = 'return' }) => {
  const [tab, setTab] = useState(initialTab);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 select-none space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
          গ্রাহক নীতি ও সেবার শর্তাবলী
        </h1>
        <p className="text-xs text-gray-500">
          গ্লোবাল বাজার বিডি শপের স্বচ্ছ ও বিশ্বাসযোগ্য নীতিমালা
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 bg-gray-100 p-1.5 rounded-2xl">
        <button
          onClick={() => setTab('return')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            tab === 'return' ? 'bg-white text-teal-800 shadow-xs' : 'text-gray-600 hover:text-black'
          }`}
        >
          রিটার্ন ও রিফান্ড পলিসি
        </button>

        <button
          onClick={() => setTab('shipping')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            tab === 'shipping' ? 'bg-white text-teal-800 shadow-xs' : 'text-gray-600 hover:text-black'
          }`}
        >
          ডেলিভারি ও শিপিং নীতি
        </button>

        <button
          onClick={() => setTab('privacy')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            tab === 'privacy' ? 'bg-white text-teal-800 shadow-xs' : 'text-gray-600 hover:text-black'
          }`}
        >
          প্রাইভেসি পলিসি
        </button>

        <button
          onClick={() => setTab('terms')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            tab === 'terms' ? 'bg-white text-teal-800 shadow-xs' : 'text-gray-600 hover:text-black'
          }`}
        >
          শর্তাবলী
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs text-xs sm:text-sm text-gray-700 leading-relaxed space-y-4">
        {tab === 'return' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-teal-700" />
              <span>৭ দিনের সহজ রিটার্ন ও এক্সচেঞ্জ পলিসি</span>
            </h2>
            <p>
              গ্লোবাল বাজার বিডি শপ থেকে ক্রয়কৃত যেকোনো পণ্যে কোনো ত্রুটি থাকলে অথবা ছবির সাথে মিল না থাকলে ডেলিভারি গ্রহণের ৭ দিনের মধ্যে এক্সচেঞ্জ বা রিফান্ড পাওয়া সম্ভব।
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>ডেলিভারি ম্যানের উপস্থিতিতে পণ্য দেখে বুঝে নেওয়ার সুযোগ রয়েছে।</li>
              <li>পণ্যটি অব্যবহৃত অবস্থায় আসল প্যাকেজিং ও ইনভয়েস সহ জমা দিতে হবে।</li>
              <li>রিফান্ডের ক্ষেত্রে বিকাশ, নগদ অথবা ব্যাংক ট্রান্সফারের মাধ্যমে ৩-৫ কার্যদিবসের মধ্যে অর্থ ফেরত প্রদান করা হয়।</li>
            </ul>
          </div>
        )}

        {tab === 'shipping' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
              <Truck className="w-5 h-5 text-teal-700" />
              <span>ডেলিভারি চার্জ ও সময়সূচী</span>
            </h2>
            <p>
              আমরা স্টিডফাস্ট, সুন্দরবন কুরিয়ার, পাঠাও ও রেডএক্স-এর মাধ্যমে দেশের ৬৪টি জেলায় বিশ্বস্ততার সাথে পার্সেল ডেলিভারি করে থাকি।
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>ঢাকার ভেতরে:</strong> ২৪ থেকে ৪৮ ঘণ্টার মধ্যে ডেলিভারি, চার্জ ৳৭০।</li>
              <li><strong>ঢাকার বাইরে (সমগ্র বাংলাদেশ):</strong> ২ থেকে ৪ দিনের মধ্যে ডেলিভারি, চার্জ ৳১৩০।</li>
              <li><strong>ফ্রি ডেলিভারি অফার:</strong> যেকোনো অর্ডারের মূল্য ২০০০ টাকার বেশি হলে ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!</li>
            </ul>
          </div>
        )}

        {tab === 'privacy' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-700" />
              <span>গ্রাহক তথ্যের নিরাপত্তা ও প্রাইভেসি</span>
            </h2>
            <p>
              আপনার ব্যক্তিগত গোপনীয়তা রক্ষা করা আমাদের দায়িত্ব। আমরা আপনার নাম, ফোন নম্বর, ডেলিভারি ঠিকানা এবং ইমেইল সুরক্ষিত ডাটাবেজে সংরক্ষণ করি এবং কোনো তৃতীয় পক্ষের কাছে বিক্রি বা অপব্যবহার করি না।
            </p>
            <p>
              পাসওয়ার্ড ও সংবেদনশীল তথ্যসমূহ আধুনিক সল্টেড হ্যাশিং (BCrypt) অ্যালগরিদমের মাধ্যমে এনক্রিপ্ট করা থাকে।
            </p>
          </div>
        )}

        {tab === 'terms' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-700" />
              <span>ব্যবহারের সাধারণ শর্তাবলী</span>
            </h2>
            <p>
              গ্লোবাল বাজার বিডি ওয়েবসাইট ব্রাউজ ও কেনাকাটা করার মাধ্যমে আপনি আমাদের শর্তাবলীর সাথে সম্মত প্রকাশ করছেন।
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>সব পণ্যের স্টক ও মূল্য নিয়মিত আপডেট করা হয়।</li>
              <li>অনিবার্য কারণে অর্ডার বাতিল হলে গ্রাহককে অবিলম্বে অবহিত করা হবে।</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
