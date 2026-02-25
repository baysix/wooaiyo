import type { PostType, PostStatus, OpenChatType, UserRole, OpenChatCategory } from '@/types/database';

// Post type labels
export const POST_TYPE_LABELS: Record<PostType, string> = {
  sale: '판매',
  share: '나눔',
  rental: '대여',
};

// Post status labels by type
export const POST_STATUS_LABELS: Record<PostType, Record<PostStatus, string>> = {
  sale: {
    active: '판매중',
    reserved: '예약중',
    completed: '거래완료',
    hidden: '숨김',
  },
  share: {
    active: '나눔중',
    reserved: '나눔예약',
    completed: '나눔완료',
    hidden: '숨김',
  },
  rental: {
    active: '대여가능',
    reserved: '대여중',
    completed: '반납완료',
    hidden: '숨김',
  },
};

// Status badge colors
export const STATUS_COLORS: Record<PostStatus, string> = {
  active: 'bg-green-100 text-green-800',
  reserved: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-gray-100 text-gray-600',
  hidden: 'bg-gray-100 text-gray-400',
};

// Post type colors
export const TYPE_COLORS: Record<PostType, string> = {
  sale: 'bg-blue-100 text-blue-800',
  share: 'bg-pink-100 text-pink-800',
  rental: 'bg-purple-100 text-purple-800',
};

// Default categories
export const DEFAULT_CATEGORIES = [
  { name: '가전/디지털', icon: '💻' },
  { name: '가구/인테리어', icon: '🪑' },
  { name: '유아/아동', icon: '👶' },
  { name: '생활/주방', icon: '🍳' },
  { name: '의류/잡화', icon: '👕' },
  { name: '도서/취미', icon: '📚' },
  { name: '스포츠/레저', icon: '⚽' },
  { name: '반려동물', icon: '🐾' },
  { name: '식품', icon: '🥬' },
  { name: '기타', icon: '📦' },
] as const;

// Open chat type labels
export const OPEN_CHAT_TYPE_LABELS: Record<OpenChatType, string> = {
  public: '공개',
  private: '비공개',
};

export const OPEN_CHAT_TYPE_COLORS: Record<OpenChatType, string> = {
  public: 'bg-green-100 text-green-800',
  private: 'bg-orange-100 text-orange-800',
};

// Open chat categories
export const OPEN_CHAT_CATEGORIES: { value: OpenChatCategory; label: string; icon: string }[] = [
  { value: '게임', label: '게임', icon: '🎮' },
  { value: '친목', label: '친목', icon: '🤝' },
  { value: '운동', label: '운동', icon: '🏃' },
  { value: '취미', label: '취미', icon: '🎨' },
  { value: '육아', label: '육아', icon: '👶' },
  { value: '반려동물', label: '반려동물', icon: '🐾' },
  { value: '부동산', label: '부동산', icon: '🏠' },
  { value: '기타', label: '기타', icon: '📦' },
];

export const OPEN_CHAT_CATEGORY_COLORS: Record<OpenChatCategory, string> = {
  '게임': 'bg-indigo-100 text-indigo-800',
  '친목': 'bg-pink-100 text-pink-800',
  '운동': 'bg-green-100 text-green-800',
  '취미': 'bg-yellow-100 text-yellow-800',
  '육아': 'bg-blue-100 text-blue-800',
  '반려동물': 'bg-amber-100 text-amber-800',
  '부동산': 'bg-teal-100 text-teal-800',
  '기타': 'bg-gray-100 text-gray-800',
};

// User role labels
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  resident: '입주민',
  manager: '관리자',
  admin: '운영자',
};

// App info
export const APP_NAME = '우아이요';
export const APP_DESCRIPTION = '우리 아파트는 이게 있어요';
export const DEFAULT_WOO_AH_SCORE = 50;
