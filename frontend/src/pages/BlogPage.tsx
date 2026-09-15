import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BlogPost } from '../types/index';
import { fetchApi } from '../services/api';
import { Clock, User, ArrowRight, BookOpen } from 'lucide-react';

interface BlogPageProps {
  onNavigate: (page: string, param?: string) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ onNavigate }) => {
  const { lang, t } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<{ success: boolean; posts: BlogPost[] }>('/blog')
      .then(res => {
        if (res.success) setPosts(res.posts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 select-none space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
          <BookOpen className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          {t('nav.blog')}
        </h1>
        <p className="text-xs text-gray-500">
          {lang === 'bn'
            ? 'স্মার্ট শপিং গাইড, গ্যাজেট টিপস এবং স্বাস্থ্যকর জীবনযাপনের জরুরি পরামর্শ'
            : 'Smart shopping guides, gadget reviews and lifestyle tips in Bangladesh'}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-white rounded-3xl animate-pulse border border-gray-100" />
          <div className="h-64 bg-white rounded-3xl animate-pulse border border-gray-100" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map(post => (
            <div
              key={post.id}
              onClick={() => onNavigate('blog-post', post.slug)}
              className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div className="relative pt-[50%] bg-gray-100 overflow-hidden">
                <img
                  src={post.cover_image || 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800'}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-teal-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {post.category}
                </span>
              </div>

              <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.read_time}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {post.author}
                    </span>
                  </div>

                  <h2 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-teal-700 transition-colors leading-snug">
                    {lang === 'bn' ? post.title_bn : post.title_en}
                  </h2>

                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {lang === 'bn' ? post.summary_bn : post.summary_en}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center text-xs font-bold text-teal-700 group-hover:underline">
                  <span>{lang === 'bn' ? 'সম্পূর্ণ পড়ুন' : 'Read Article'}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const BlogPostPage: React.FC<{ slug: string; onNavigate: (page: string, param?: string) => void }> = ({
  slug,
  onNavigate
}) => {
  const { lang, t } = useLanguage();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<{ success: boolean; post: BlogPost }>(`/blog/${slug}`)
      .then(res => {
        if (res.success) setPost(res.post);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading || !post) {
    return <div className="max-w-3xl mx-auto py-16 text-center text-xs text-gray-400">লোড হচ্ছে...</div>;
  }

  return (
    <article className="max-w-3xl mx-auto px-4 py-10 select-none space-y-6">
      <button
        onClick={() => onNavigate('blog')}
        className="text-xs font-bold text-teal-700 hover:underline cursor-pointer"
      >
        ← {lang === 'bn' ? 'ব্লগ তালিকায় ফিরে যান' : 'Back to Blogs'}
      </button>

      <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-3 py-1 rounded-full">
        {post.category}
      </span>

      <h1 className="text-2xl sm:text-4xl font-black text-gray-900 leading-tight">
        {lang === 'bn' ? post.title_bn : post.title_en}
      </h1>

      <div className="flex items-center gap-3 text-xs text-gray-400 pb-4 border-b border-gray-100">
        <span>{post.author}</span>
        <span>•</span>
        <span>{post.read_time}</span>
        <span>•</span>
        <span>{new Date(post.created_at).toLocaleDateString()}</span>
      </div>

      {post.cover_image && (
        <div className="rounded-3xl overflow-hidden shadow-sm">
          <img src={post.cover_image} alt="" className="w-full h-80 object-cover" />
        </div>
      )}

      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line pt-2">
        {lang === 'bn' ? post.content_bn : post.content_en}
      </div>
    </article>
  );
};
