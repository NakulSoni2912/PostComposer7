/**
 * @file composerRoute.js
 * @description Express routes for the Instagram Post Composer.
 * Handles multer storage for media attachments and maps composer endpoints to composerController.
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const composerController = require('../controllers/composerController');

const router = express.Router();

// Define destination folder for media attachments upload
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

// Multer storage engine configuration
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Composer collection endpoints (GET to read list, POST to create single post draft)
router.route('/')
  .get((req, res, next) => composerController.getComposerPosts(req, res, next))
  .post(upload.single('media'), (req, res, next) => composerController.createComposerPost(req, res, next));

// Composer individual resource endpoints (GET detail, PUT update details/media, DELETE post)
router.route('/:id')
  .get((req, res, next) => composerController.getComposerPost(req, res, next))
  .put(upload.single('media'), (req, res, next) => composerController.updateComposerPost(req, res, next))
  .delete((req, res, next) => composerController.deleteComposerPost(req, res, next));

module.exports = router;
