# Item Return Desk - Supabase Database Schema

## Overview
Complete database schema for Lost & Found campus application with authentication, posts, chats, and notifications.

---

## Storage Buckets

### 1. `post-images`
- **Purpose**: Store post images
- **Public**: Yes (read-only for public, write for authenticated)
- **File size limit**: 5MB
- **Allowed MIME types**: image/jpeg, image/png, image/webp
- **Path structure**: `posts/{post_id}/{filename}`

### 2. `post-videos`
- **Purpose**: Store post videos
- **Public**: Yes (read-only for public, write for authenticated)
- **File size limit**: 50MB
- **Allowed MIME types**: video/mp4, video/quicktime
- **Path structure**: `posts/{post_id}/{filename}`

### 3. `user-avatars`
- **Purpose**: Store user profile images
- **Public**: Yes (read-only for public, write for owner only)
- **File size limit**: 2MB
- **Allowed MIME types**: image/jpeg, image/png, image/webp
- **Path structure**: `avatars/{user_id}/{filename}`

---

## Database Tables

### 1. `profiles`
Stores user profile information (extends Supabase Auth users).

**Columns:**
- `id` (UUID, PK, FK → auth.users.id)
- `email` (TEXT, NOT NULL, UNIQUE)
- `name` (TEXT)
- `avatar_url` (TEXT) - Reference to storage bucket
- `phone` (TEXT)
- `role` (TEXT, DEFAULT 'user') - 'user' or 'admin'
- `created_at` (TIMESTAMP, DEFAULT now())
- `updated_at` (TIMESTAMP, DEFAULT now())

**Indexes:**
- Index on `email`
- Index on `role`

---

### 2. `posts`
Main table for Lost/Found items.

**Columns:**
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `user_id` (UUID, FK → profiles.id, NOT NULL)
- `type` (TEXT, NOT NULL) - 'Lost' or 'Found'
- `title` (TEXT, NOT NULL)
- `description` (TEXT, NOT NULL)
- `category` (TEXT, NOT NULL) - 'Electronics', 'ID Cards', 'Accessories', 'Clothing', 'Books', 'Other'
- `location` (TEXT, NOT NULL)
- `tip_amount` (DECIMAL(10,2)) - Reward amount (NULL for Found posts)
- `status` (TEXT, DEFAULT 'active') - 'active', 'claimed', 'resolved', 'archived'
- `claimed_by` (UUID, FK → profiles.id) - User who claimed the item
- `claimed_at` (TIMESTAMP) - When item was claimed
- `created_at` (TIMESTAMP, DEFAULT now())
- `updated_at` (TIMESTAMP, DEFAULT now())
- `expires_at` (TIMESTAMP) - Auto-archive after 30 days

**Indexes:**
- Index on `user_id`
- Index on `type`
- Index on `category`
- Index on `status`
- Index on `created_at` (DESC)
- Composite index on `(type, status, created_at)`

---

### 3. `post_images`
Stores image URLs for posts.

**Columns:**
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `post_id` (UUID, FK → posts.id, ON DELETE CASCADE, NOT NULL)
- `image_url` (TEXT, NOT NULL) - Storage bucket path
- `image_order` (INTEGER, DEFAULT 0) - For ordering multiple images
- `created_at` (TIMESTAMP, DEFAULT now())

**Indexes:**
- Index on `post_id`
- Composite index on `(post_id, image_order)`

---

### 4. `post_videos`
Stores video URLs for posts.

**Columns:**
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `post_id` (UUID, FK → posts.id, ON DELETE CASCADE, NOT NULL)
- `video_url` (TEXT, NOT NULL) - Storage bucket path
- `thumbnail_url` (TEXT) - Video thumbnail
- `duration` (INTEGER) - Video duration in seconds
- `created_at` (TIMESTAMP, DEFAULT now())

**Indexes:**
- Index on `post_id`

---

### 5. `conversations`
Chat conversations between users about a post.

**Columns:**
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `post_id` (UUID, FK → posts.id, ON DELETE CASCADE, NOT NULL)
- `user1_id` (UUID, FK → profiles.id, NOT NULL) - Post owner
- `user2_id` (UUID, FK → profiles.id, NOT NULL) - Interested user
- `last_message_at` (TIMESTAMP) - Last message timestamp
- `created_at` (TIMESTAMP, DEFAULT now())
- `updated_at` (TIMESTAMP, DEFAULT now())

**Indexes:**
- Index on `post_id`
- Index on `user1_id`
- Index on `user2_id`
- Composite unique index on `(user1_id, user2_id, post_id)`
- Index on `last_message_at` (DESC)

---

### 6. `messages`
Individual messages in conversations.

**Columns:**
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `conversation_id` (UUID, FK → conversations.id, ON DELETE CASCADE, NOT NULL)
- `sender_id` (UUID, FK → profiles.id, NOT NULL)
- `message_text` (TEXT, NOT NULL)
- `is_read` (BOOLEAN, DEFAULT false)
- `read_at` (TIMESTAMP)
- `created_at` (TIMESTAMP, DEFAULT now())

**Indexes:**
- Index on `conversation_id`
- Index on `sender_id`
- Index on `created_at` (DESC)
- Composite index on `(conversation_id, created_at)`

---

### 7. `notifications`
User notifications for various events.

**Columns:**
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `user_id` (UUID, FK → profiles.id, ON DELETE CASCADE, NOT NULL)
- `type` (TEXT, NOT NULL) - 'message', 'match', 'claim', 'contact', 'admin'
- `title` (TEXT, NOT NULL)
- `message` (TEXT, NOT NULL)
- `post_id` (UUID, FK → posts.id, ON DELETE SET NULL)
- `conversation_id` (UUID, FK → conversations.id, ON DELETE SET NULL)
- `related_user_id` (UUID, FK → profiles.id, ON DELETE SET NULL) - User who triggered notification
- `is_read` (BOOLEAN, DEFAULT false)
- `read_at` (TIMESTAMP)
- `created_at` (TIMESTAMP, DEFAULT now())

**Indexes:**
- Index on `user_id`
- Index on `is_read`
- Index on `created_at` (DESC)
- Composite index on `(user_id, is_read, created_at)`

---

## Relationships

1. **profiles** → **posts** (One-to-Many)
   - A user can have multiple posts

2. **posts** → **post_images** (One-to-Many)
   - A post can have multiple images

3. **posts** → **post_videos** (One-to-Many)
   - A post can have multiple videos

4. **posts** → **conversations** (One-to-Many)
   - A post can have multiple conversations

5. **conversations** → **messages** (One-to-Many)
   - A conversation can have multiple messages

6. **profiles** → **conversations** (Many-to-Many via user1_id and user2_id)
   - Users can have multiple conversations

7. **profiles** → **notifications** (One-to-Many)
   - A user can have multiple notifications

---

## Row Level Security (RLS) Policies

### profiles
- **SELECT**: Public can read all profiles
- **INSERT**: Users can insert their own profile (via trigger)
- **UPDATE**: Users can update their own profile, admins can update any
- **DELETE**: Only admins can delete profiles

### posts
- **SELECT**: Public can read all active posts, users can read their own posts (any status)
- **INSERT**: Authenticated users can create posts
- **UPDATE**: Users can update their own posts, admins can update any
- **DELETE**: Users can delete their own posts, admins can delete any

### post_images
- **SELECT**: Public can read all images
- **INSERT**: Users can insert images for their own posts
- **UPDATE**: Users can update images for their own posts, admins can update any
- **DELETE**: Users can delete images for their own posts, admins can delete any

### post_videos
- **SELECT**: Public can read all videos
- **INSERT**: Users can insert videos for their own posts
- **UPDATE**: Users can update videos for their own posts, admins can delete any
- **DELETE**: Users can delete videos for their own posts, admins can delete any

### conversations
- **SELECT**: Users can read conversations where they are user1 or user2
- **INSERT**: Authenticated users can create conversations
- **UPDATE**: Users can update conversations where they are user1 or user2
- **DELETE**: Users can delete conversations where they are user1 or user2

### messages
- **SELECT**: Users can read messages in conversations where they are participant
- **INSERT**: Users can send messages in conversations where they are participant
- **UPDATE**: Users can update their own messages (for edit/delete)
- **DELETE**: Users can delete their own messages

### notifications
- **SELECT**: Users can read their own notifications
- **INSERT**: System can create notifications (via triggers/functions)
- **UPDATE**: Users can update their own notifications (mark as read)
- **DELETE**: Users can delete their own notifications

---

## Functions & Triggers

### Functions
1. **update_updated_at_column()** - Auto-update `updated_at` timestamp
2. **create_profile_for_user()** - Auto-create profile when user signs up
3. **update_conversation_last_message()** - Update conversation last_message_at when new message is sent
4. **notify_message_sent()** - Create notification when message is sent
5. **auto_archive_old_posts()** - Auto-archive posts older than 30 days
6. **get_unread_message_count()** - Get unread message count for a user

### Triggers
1. **set_updated_at** - On UPDATE for tables with updated_at column
2. **handle_new_user** - On INSERT into auth.users → create profile
3. **handle_new_message** - On INSERT into messages → update conversation and create notification
4. **handle_post_expiry** - Daily cron job to archive old posts

---

## Enums/Check Constraints

### Post Type
- CHECK constraint: `type IN ('Lost', 'Found')`

### Post Status
- CHECK constraint: `status IN ('active', 'claimed', 'resolved', 'archived')`

### Post Category
- CHECK constraint: `category IN ('Electronics', 'ID Cards', 'Accessories', 'Clothing', 'Books', 'Other')`

### User Role
- CHECK constraint: `role IN ('user', 'admin')`

### Notification Type
- CHECK constraint: `type IN ('message', 'match', 'claim', 'contact', 'admin')`

---

## Important Notes

1. **Authentication**: Use Supabase Auth for user authentication. Passwords are automatically hashed by Supabase.

2. **Storage**: All media files are stored in Supabase Storage buckets with proper access policies.

3. **Auto-expiry**: Posts are automatically archived after 30 days via cron job or trigger.

4. **Real-time**: Enable Supabase Realtime for:
   - New messages in conversations
   - New notifications
   - Post status updates

5. **Performance**: Use indexes on frequently queried columns (user_id, post_id, created_at, status).

6. **Data Integrity**: Use foreign keys with ON DELETE CASCADE where appropriate (post_images, post_videos, messages).

