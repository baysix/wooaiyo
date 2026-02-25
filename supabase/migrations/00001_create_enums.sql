-- Post transaction type
CREATE TYPE post_type AS ENUM ('sale', 'share', 'rental');

-- Post status (unified across types, valid transitions differ per type)
CREATE TYPE post_status AS ENUM ('active', 'reserved', 'completed', 'hidden');

-- Notification type
CREATE TYPE notification_type AS ENUM (
  'chat_message',
  'status_change',
  'keyword_match',
  'review_request',
  'notice'
);
