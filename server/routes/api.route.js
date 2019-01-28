const express = require('express');
const router = express.Router();

const projectsRouter = require('./projects.route');
router.use('/projects', projectsRouter);

module.exports = router;