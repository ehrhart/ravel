const express = require('express');
const multer = require('multer');
const router = express.Router();
const upload = multer({ dest: 'uploads/' })

const projectController = require('../controllers/projects.controller');

router.get('/', projectController.projects_get_all);
router.get('/:id', projectController.projects_get_by_id);
router.post('/', projectController.projects_post);
router.put('/:id', projectController.projects_put);
router.delete('/:id', projectController.projects_delete);
router.post('/upload', upload.single('file'), projectController.projects_upload);

module.exports = router;