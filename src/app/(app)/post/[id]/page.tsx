import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/layout/header';
import PostActionBar from '@/components/post/post-action-bar';
import PostDeleteButton from '@/components/post/post-delete-button';
import PostShareButton from '@/components/post/post-share-button';
import { createClient } from '@/lib/supabase/server';
import { requireAuthWithRole, isAdmin as checkIsAdmin } from '@/lib/auth';
import { POST_TYPE_LABELS, POST_STATUS_LABELS, STATUS_COLORS, TYPE_COLORS } from '@/lib/constants';
import { formatPrice, formatDate } from '@/lib/utils';
import type { PostWithAuthor, PostType } from '@/types/database';
import { notFound } from 'next/navigation';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://wooaiyo.vercel.app';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = createClient();

  const { data: post } = await supabase
    .from('posts')
    .select('title, description, images, type, price, rental_fee')
    .eq('id', id)
    .single();

  if (!post) {
    return { title: '글을 찾을 수 없습니다 - 우아이요' };
  }

  const typeLabel = POST_TYPE_LABELS[post.type as PostType];
  const title = `[${typeLabel}] ${post.title}`;
  const description = post.description?.slice(0, 100) || '우아이요에서 확인하세요';
  const image = post.images?.[0] || `${BASE_URL}/logo.png`;

  return {
    title: `${title} - 우아이요`,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 800, height: 600 }],
      url: `${BASE_URL}/post/${id}`,
      type: 'article',
      siteName: '우아이요',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requireAuthWithRole();
  const supabase = createClient();
  const userIsAdmin = checkIsAdmin(auth.role);

  const { data: post } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!author_id(id, nickname, avatar_url, manner_score),
      category:categories(id, name, icon),
      location:apartment_locations(id, name)
    `)
    .eq('id', id)
    .single();

  if (!post) notFound();

  const p = post as unknown as PostWithAuthor & { author: { manner_score: number } };
  const isAuthor = auth.userId === p.author_id;

  // Check if bookmarked
  const { data: bookmark } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('post_id', id)
    .eq('user_id', auth.userId)
    .single();

  // Build share data
  const priceText = p.type === 'share'
    ? '나눔'
    : p.type === 'rental'
    ? (p.rental_fee ? formatPrice(p.rental_fee) + '/일' : '무료 대여')
    : (p.price ? formatPrice(p.price) : '가격 미정');

  const shareData = {
    title: `[${POST_TYPE_LABELS[p.type]}] ${p.title}`,
    description: '',
    price: priceText,
    imageUrl: p.images?.[0] || '',
    link: `${BASE_URL}/post/${id}`,
  };

  return (
    <>
      <Header
        showBack
        showNotification={false}
        rightAction={
          <div className="flex items-center gap-2">
            <PostShareButton {...shareData} />
            {(isAuthor || userIsAdmin) && (
              <>
                {isAuthor && (
                  <Link href={`/post/${id}/edit`} className="text-sm text-gray-500">
                    수정
                  </Link>
                )}
                <PostDeleteButton postId={id} />
              </>
            )}
          </div>
        }
      />

      {/* Image carousel */}
      <div className="relative">
        {p.images && p.images.length > 0 ? (
          <div className="flex snap-x snap-mandatory overflow-x-auto hide-scrollbar">
            {p.images.map((img, i) => (
              <div key={i} className="h-80 w-full flex-shrink-0 snap-center">
                <img src={img} alt={`${p.title} ${i + 1}`} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center bg-gray-100 text-gray-300">
            <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {p.images && p.images.length > 1 && (
          <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white">
            1/{p.images.length}
          </div>
        )}
      </div>

      {/* Author info */}
      <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-lg">
          {p.author.avatar_url ? (
            <img src={p.author.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
          ) : (
            '👤'
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">{p.author.nickname}</p>
          <p className="text-xs text-gray-500">우아점수 {p.author.manner_score}점</p>
        </div>
      </div>

      {/* Post content */}
      <div className="px-4 py-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${TYPE_COLORS[p.type]}`}>
            {POST_TYPE_LABELS[p.type]}
          </span>
          {p.status !== 'active' && (
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[p.status]}`}>
              {POST_STATUS_LABELS[p.type][p.status]}
            </span>
          )}
          {p.category && (
            <span className="text-xs text-gray-400">{p.category.icon} {p.category.name}</span>
          )}
        </div>

        <h1 className="text-lg font-bold">{p.title}</h1>

        {/* Price/info by type */}
        <div className="text-lg font-bold text-[#20C997]">
          {p.type === 'share' && '나눔 💚'}
          {p.type === 'sale' && (
            <>
              {p.price ? formatPrice(p.price) : '가격 미정'}
              {p.is_negotiable && <span className="ml-2 text-sm font-normal text-gray-500">가격 제안 가능</span>}
            </>
          )}
          {p.type === 'rental' && (
            <div className="space-y-1">
              {p.rental_fee && <div>{formatPrice(p.rental_fee)} <span className="text-sm font-normal text-gray-500">/ 대여비</span></div>}
              {p.deposit && <div className="text-sm font-normal text-gray-600">보증금 {formatPrice(p.deposit)}</div>}
              {p.rental_period && <div className="text-sm font-normal text-gray-500">대여 기간: {p.rental_period}</div>}
            </div>
          )}
        </div>

        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{p.description}</p>

        {/* Meta */}
        <div className="flex items-center gap-2 text-xs text-gray-400 pt-2">
          {p.location && <span>{p.location.name}</span>}
          <span>·</span>
          <span>{formatDate(p.created_at)}</span>
          <span>·</span>
          <span>조회 {p.view_count}</span>
        </div>
      </div>

      {/* Bottom action bar */}
      {!isAuthor && (
        <PostActionBar postId={id} initialBookmarked={!!bookmark} shareData={shareData} />
      )}
    </>
  );
}
