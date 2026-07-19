const fs = require('fs');
const path = require('path');
const ComposerPost = require('../models/ComposerPost');

/**
 * Service class implementing core business logic for composer posts,
 * structured similar to a Java Service layer (e.g., Spring @Service).
 */
class ComposerPostService {
  
  /**
   * Helper method to format file upload data
   */
  normalizeMedia(file) {
    if (!file) {
      return { mediaUrl: '', mediaName: '' };
    }
    return {
      mediaUrl: `/public/uploads/${file.filename}`,
      mediaName: file.originalname,
    };
  }

  /**
   * Helper method to remove physical local file uploads
   */
  removeLocalFile(mediaUrl) {
    if (!mediaUrl) {
      return;
    }
    const filePath = path.join(__dirname, '..', mediaUrl.replace(/^\//, ''));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  /**
   * Retrieve all composer posts, ordered by creation date descending
   */
  async getAllPosts() {
    return await ComposerPost.find().sort({ createdAt: -1 });
  }

  /**
   * Find a single post by its ID
   */
  async getPostById(id) {
    return await ComposerPost.findById(id);
  }

  /**
   * Create a new post, with optional file attachment
   */
  async createPost(body, file) {
    const { platform, title, description, status, scheduleAt } = body;

    if (!platform || !title || !description) {
      throw new Error('platform, title, and description are required');
    }

    if (status === 'scheduled' && !scheduleAt) {
      throw new Error('scheduleAt is required when status is scheduled');
    }

    const media = this.normalizeMedia(file);
    
    return await ComposerPost.create({
      platform,
      title,
      description,
      status: status || 'posted',
      scheduleAt: scheduleAt ? new Date(scheduleAt) : undefined,
      ...media,
    });
  }

  /**
   * Update an existing post, replacing media if a new file is attached
   */
  async updatePost(id, body, file) {
    const current = await this.getPostById(id);
    if (!current) {
      return null;
    }

    const media = this.normalizeMedia(file);
    const updateData = {
      platform: body.platform ?? current.platform,
      title: body.title ?? current.title,
      description: body.description ?? current.description,
      status: body.status ?? current.status,
      scheduleAt: body.scheduleAt ? new Date(body.scheduleAt) : current.scheduleAt,
    };

    if (file) {
      Object.assign(updateData, media);
    }

    const updated = await ComposerPost.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    // Clean up old file if replaced
    if (file && current.mediaUrl && current.mediaUrl !== updated.mediaUrl) {
      this.removeLocalFile(current.mediaUrl);
    }

    return updated;
  }

  /**
   * Delete a post and remove its associated media file
   */
  async deletePost(id) {
    const post = await ComposerPost.findByIdAndDelete(id);
    if (!post) {
      return null;
    }
    this.removeLocalFile(post.mediaUrl);
    return post;
  }
}

module.exports = new ComposerPostService();
