import { supabase } from '../../config/supabase';

/**
 * Post Service
 * Handles all post-related operations
 */

/**
 * Format date to relative time (e.g., "2h ago", "3d ago")
 */
const formatTimeAgo = (date) => {
  const now = new Date();
  const postDate = new Date(date);
  const diffMs = now - postDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return `${Math.floor(diffDays / 7)}w ago`;
  }
};

export const postService = {
  /**
   * Get statistics (counts of lost, found, and user's posts)
   * @param {string} userId - Current user ID (for myPosts count)
   * @returns {Promise<{success: boolean, data?: {lostItems: number, foundItems: number, myPosts: number}, error?: string}>}
   */
  async getStats(userId) {
    try {
      // Get active lost items count
      const { count: lostCount, error: lostError } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'Lost')
        .eq('status', 'active');

      if (lostError) throw lostError;

      // Get active found items count
      const { count: foundCount, error: foundError } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'Found')
        .eq('status', 'active');

      if (foundError) throw foundError;

      // Get user's posts count
      const { count: myPostsCount, error: myPostsError } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (myPostsError) throw myPostsError;

      return {
        success: true,
        data: {
          lostItems: lostCount || 0,
          foundItems: foundCount || 0,
          myPosts: myPostsCount || 0,
        },
      };
    } catch (error) {
      console.error('Get stats error:', error);
      return { success: false, error: error.message || 'Failed to get stats' };
    }
  },

  /**
   * Get recent posts with time filtering
   * @param {string} timeFilter - '24h' or '7d'
   * @param {number} limit - Maximum number of posts to return
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async getRecentPosts(timeFilter = '24h', limit = 10) {
    try {
      // Calculate time threshold
      const now = new Date();
      const hoursAgo = timeFilter === '24h' ? 24 : 168; // 168 hours = 7 days
      const thresholdDate = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          type,
          title,
          description,
          category,
          location,
          status,
          created_at,
          profiles:user_id (
            id,
            name,
            avatar_url
          )
        `)
        .eq('status', 'active')
        .gte('created_at', thresholdDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return { success: false, error: error.message };
      }

      // Format posts with time ago
      const formattedPosts = (data || []).map((post) => ({
        id: post.id,
        type: post.type,
        title: post.title,
        description: post.description,
        category: post.category,
        location: post.location,
        status: post.status,
        createdAt: new Date(post.created_at),
        time: formatTimeAgo(post.created_at),
        user: post.profiles,
      }));

      return { success: true, data: formattedPosts };
    } catch (error) {
      console.error('Get recent posts error:', error);
      return { success: false, error: error.message || 'Failed to get recent posts' };
    }
  },

  /**
   * Get all posts by type (Lost/Found)
   * @param {string} type - 'Lost' or 'Found'
   * @param {object} filters - Optional filters (category, location, search)
   * @param {number} limit - Maximum number of posts
   * @param {number} offset - Offset for pagination
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async getPostsByType(type, filters = {}, limit = 20, offset = 0) {
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            id,
            name,
            avatar_url
          ),
          post_images (*)
        `)
        .eq('type', type)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      // Format posts
      const formattedPosts = (data || []).map((post) => ({
        ...post,
        createdAt: new Date(post.created_at),
        time: formatTimeAgo(post.created_at),
      }));

      return { success: true, data: formattedPosts };
    } catch (error) {
      console.error('Get posts by type error:', error);
      return { success: false, error: error.message || 'Failed to get posts' };
    }
  },

  /**
   * Get post by ID with all details
   * @param {string} postId - Post ID
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  async getPostById(postId) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            id,
            name,
            email,
            avatar_url,
            phone
          ),
          post_images (*),
          post_videos (*)
        `)
        .eq('id', postId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: {
          ...data,
          createdAt: new Date(data.created_at),
          time: formatTimeAgo(data.created_at),
        },
      };
    } catch (error) {
      console.error('Get post by ID error:', error);
      return { success: false, error: error.message || 'Failed to get post' };
    }
  },

  /**
   * Get user's posts
   * @param {string} userId - User ID
   * @param {object} filters - Optional filters (type, status, category)
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async getUserPosts(userId, filters = {}) {
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          post_images (*)
        `)
        .eq('user_id', userId);

      // Apply filters
      if (filters.type && filters.type !== 'All') {
        query = query.eq('type', filters.type);
      }
      if (filters.status && filters.status !== 'All') {
        // Map UI status (capitalized) to database status (lowercase)
        const statusMap = {
          'Active': 'active',
          'Claimed': 'claimed',
          'Resolved': 'resolved',
          'Archived': 'archived',
        };
        const dbStatus = statusMap[filters.status] || filters.status.toLowerCase();
        query = query.eq('status', dbStatus);
      }
      if (filters.category && filters.category !== 'All') {
        query = query.eq('category', filters.category);
      }

      // Order by created_at descending (newest first)
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      // Format posts
      const formattedPosts = (data || []).map((post) => ({
        ...post,
        createdAt: new Date(post.created_at),
        created_at: post.created_at, // Keep original for sorting
        time: formatTimeAgo(post.created_at),
      }));

      return { success: true, data: formattedPosts };
    } catch (error) {
      console.error('Get user posts error:', error);
      return { success: false, error: error.message || 'Failed to get user posts' };
    }
  },

  /**
   * Create a new post
   * @param {object} postData - Post data (type, title, description, category, location, user_id, tip_amount, status)
   * @param {Array<string>} imageUrls - Array of image URLs to link to the post
   * @param {Array<string>} videoUrls - Array of video URLs to link to the post
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  async createPost(postData, imageUrls = [], videoUrls = []) {
    try {
      const { data: newPost, error: postError } = await supabase
        .from('posts')
        .insert([
          {
            user_id: postData.user_id,
            type: postData.type,
            title: postData.title,
            description: postData.description,
            category: postData.category,
            location: postData.location,
            tip_amount: postData.tip_amount || null,
            status: postData.status || 'active',
          },
        ])
        .select()
        .single();

      if (postError) {
        return { success: false, error: postError.message };
      }

      // Insert images
      if (imageUrls.length > 0) {
        const imageInserts = imageUrls.map((url, index) => ({
          post_id: newPost.id,
          image_url: url,
          image_order: index,
        }));
        const { error: imageError } = await supabase.from('post_images').insert(imageInserts);
        if (imageError) {
          console.error('Error inserting post images:', imageError);
          // Continue even if image insert fails
        }
      }

      // Insert videos
      if (videoUrls.length > 0) {
        const videoInserts = videoUrls.map((url) => ({
          post_id: newPost.id,
          video_url: url,
        }));
        const { error: videoError } = await supabase.from('post_videos').insert(videoInserts);
        if (videoError) {
          console.error('Error inserting post videos:', videoError);
          // Continue even if video insert fails
        }
      }

      return { success: true, data: newPost };
    } catch (error) {
      console.error('Create post error:', error);
      return { success: false, error: error.message || 'Failed to create post' };
    }
  },

  /**
   * Update a post
   * @param {string} postId - Post ID
   * @param {string} userId - User ID (for authorization)
   * @param {object} updates - Post updates
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  async updatePost(postId, userId, updates) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .update({
          title: updates.title,
          description: updates.description,
          category: updates.category,
          location: updates.location,
          tip_amount: updates.tipAmount || null,
        })
        .eq('id', postId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Update post error:', error);
      return { success: false, error: error.message || 'Failed to update post' };
    }
  },

  /**
   * Delete a post
   * @param {string} postId - Post ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async deletePost(postId, userId) {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Delete post error:', error);
      return { success: false, error: error.message || 'Failed to delete post' };
    }
  },
};
