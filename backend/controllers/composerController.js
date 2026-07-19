const composerPostService = require('../services/composerService');

/**
 * Controller class executing Express request handlers,
 * structured similar to a Java controller (e.g., Spring @RestController).
 */
class ComposerController {
  
  /**
   * CREATE mapping: Handles incoming post creations
   */
  async createComposerPost(req, res, next) {
    try {
      const post = await composerPostService.createPost(req.body, req.file);
      return res.status(201).json(post);
    } catch (error) {
      if (error.message.includes('required')) {
        return res.status(400).json({ message: error.message });
      }
      return next(error);
    }
  }

  /**
   * GET mapping: Retrieves all posts
   */
  async getComposerPosts(req, res, next) {
    try {
      const posts = await composerPostService.getAllPosts();
      return res.json(posts);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET mapping: Retrieves a single post by ID
   */
  async getComposerPost(req, res, next) {
    try {
      const post = await composerPostService.getPostById(req.params.id);
      if (!post) {
        return res.status(404).json({ message: 'Composer post not found' });
      }
      return res.json(post);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * PUT mapping: Updates a post by ID
   */
  async updateComposerPost(req, res, next) {
    try {
      const post = await composerPostService.updatePost(req.params.id, req.body, req.file);
      if (!post) {
        return res.status(404).json({ message: 'Composer post not found' });
      }
      return res.json(post);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * DELETE mapping: Deletes a post by ID
   */
  async deleteComposerPost(req, res, next) {
    try {
      const post = await composerPostService.deletePost(req.params.id);
      if (!post) {
        return res.status(404).json({ message: 'Composer post not found' });
      }
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }
}

// Export controller singleton
module.exports = new ComposerController();
