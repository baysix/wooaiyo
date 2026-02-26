export type PostType = 'sale' | 'share' | 'rental';
export type PostStatus = 'active' | 'reserved' | 'completed' | 'hidden';
export type NotificationType = 'chat_message' | 'status_change' | 'keyword_match' | 'review_request' | 'notice';
export type OpenChatType = 'public' | 'private';
export type UserRole = 'resident' | 'manager' | 'admin';
export type OpenChatCategory = '게임' | '친목' | '운동' | '취미' | '육아' | '반려동물' | '부동산' | '기타';

export interface Apartment {
  id: string;
  name: string;
  address: string;
  city: string | null;
  district: string | null;
  dong: string | null;
  total_units: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApartmentLocation {
  id: string;
  apartment_id: string;
  name: string;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export interface Profile {
  id: string;
  nickname: string;
  avatar_url: string | null;
  apartment_id: string | null;
  dong: string | null;
  role: UserRole;
  manner_score: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  sort_order: number;
}

export interface Post {
  id: string;
  author_id: string;
  apartment_id: string;
  type: PostType;
  status: PostStatus;
  title: string;
  description: string;
  category_id: string | null;
  location_id: string | null;
  images: string[];
  price: number | null;
  is_negotiable: boolean;
  quantity: number;
  deposit: number | null;
  rental_fee: number | null;
  rental_period: string | null;
  buyer_id: string | null;
  completed_at: string | null;
  view_count: number;
  chat_count: number;
  bookmark_count: number;
  is_bumped: boolean;
  bumped_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface ChatRoom {
  id: string;
  post_id: string | null;
  open_chat_id: string | null;
  buyer_id: string;
  seller_id: string;
  is_active: boolean;
  buyer_last_read_at: string | null;
  seller_last_read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OpenChat {
  id: string;
  apartment_id: string;
  creator_id: string;
  title: string;
  description: string | null;
  chat_type: OpenChatType;
  external_link: string | null;
  image_url: string | null;
  images: string[];
  category: OpenChatCategory;
  eligibility: string | null;
  access_code: string | null;
  is_active: boolean;
  participant_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  chat_room_id: string;
  sender_id: string;
  content: string;
  image_url: string | null;
  is_read: boolean;
  is_system: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  post_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  content: string | null;
  created_at: string;
}

export interface OpenChatReview {
  id: string;
  open_chat_id: string;
  reviewer_id: string;
  rating: number;
  content: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface KeywordAlert {
  id: string;
  user_id: string;
  keyword: string;
  is_active: boolean;
  created_at: string;
}

export interface Notice {
  id: string;
  apartment_id: string;
  author_id: string;
  title: string;
  content: string;
  images: string[];
  is_pinned: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface PushToken {
  id: string;
  user_id: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Joined types for common queries
export interface PostWithAuthor extends Post {
  author: Pick<Profile, 'id' | 'nickname' | 'avatar_url'>;
  category: Pick<Category, 'id' | 'name' | 'icon'> | null;
  location: Pick<ApartmentLocation, 'id' | 'name'> | null;
}

export interface ChatRoomWithDetails extends ChatRoom {
  post: Pick<Post, 'id' | 'title' | 'images' | 'type' | 'status' | 'price'> | null;
  open_chat: Pick<OpenChat, 'id' | 'title' | 'chat_type'> | null;
  buyer: Pick<Profile, 'id' | 'nickname' | 'avatar_url'>;
  seller: Pick<Profile, 'id' | 'nickname' | 'avatar_url'>;
  last_message?: Pick<Message, 'content' | 'created_at' | 'sender_id'>;
  unread_count?: number;
}

export interface OpenChatWithCreator extends OpenChat {
  creator: Pick<Profile, 'id' | 'nickname' | 'avatar_url'>;
}

export interface NoticeWithAuthor extends Notice {
  author: Pick<Profile, 'id' | 'nickname' | 'avatar_url' | 'role'>;
}

export interface OpenChatReviewWithReviewer extends OpenChatReview {
  reviewer: Pick<Profile, 'id' | 'nickname' | 'avatar_url'>;
}

export interface Database {
  public: {
    Tables: {
      apartments: { Row: Apartment; Insert: Omit<Apartment, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Apartment, 'id'>>; };
      apartment_locations: { Row: ApartmentLocation; Insert: Omit<ApartmentLocation, 'id' | 'created_at'>; Update: Partial<Omit<ApartmentLocation, 'id'>>; };
      profiles: { Row: Profile; Insert: Omit<Profile, 'created_at' | 'updated_at' | 'manner_score'>; Update: Partial<Omit<Profile, 'id'>>; };
      categories: { Row: Category; Insert: Omit<Category, 'id'>; Update: Partial<Omit<Category, 'id'>>; };
      posts: { Row: Post; Insert: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'chat_count' | 'bookmark_count' | 'is_bumped' | 'bumped_at'>; Update: Partial<Omit<Post, 'id'>>; };
      bookmarks: { Row: Bookmark; Insert: Omit<Bookmark, 'id' | 'created_at'>; Update: Partial<Omit<Bookmark, 'id'>>; };
      chat_rooms: { Row: ChatRoom; Insert: Omit<ChatRoom, 'id' | 'created_at' | 'updated_at' | 'is_active'>; Update: Partial<Omit<ChatRoom, 'id'>>; };
      messages: { Row: Message; Insert: Omit<Message, 'id' | 'created_at' | 'is_read' | 'is_system'>; Update: Partial<Omit<Message, 'id'>>; };
      reviews: { Row: Review; Insert: Omit<Review, 'id' | 'created_at'>; Update: Partial<Omit<Review, 'id'>>; };
      notifications: { Row: Notification; Insert: Omit<Notification, 'id' | 'created_at' | 'is_read'>; Update: Partial<Omit<Notification, 'id'>>; };
      keyword_alerts: { Row: KeywordAlert; Insert: Omit<KeywordAlert, 'id' | 'created_at' | 'is_active'>; Update: Partial<Omit<KeywordAlert, 'id'>>; };
      notices: { Row: Notice; Insert: Omit<Notice, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'is_pinned'>; Update: Partial<Omit<Notice, 'id'>>; };
      open_chats: { Row: OpenChat; Insert: Omit<OpenChat, 'id' | 'created_at' | 'updated_at' | 'is_active' | 'participant_count' | 'view_count' | 'image_url'>; Update: Partial<Omit<OpenChat, 'id'>>; };
      open_chat_reviews: { Row: OpenChatReview; Insert: Omit<OpenChatReview, 'id' | 'created_at'>; Update: Partial<Omit<OpenChatReview, 'id'>>; };
      push_tokens: { Row: PushToken; Insert: Omit<PushToken, 'id' | 'created_at' | 'updated_at' | 'is_active'>; Update: Partial<Omit<PushToken, 'id'>>; };
    };
  };
}
