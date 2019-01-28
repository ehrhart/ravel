const Project = require('../models/Project');

module.exports.projects_get_all = async (req, res, next) => {
  const projects = await Project.find({}).exec();
  res.send(projects);
};

module.exports.projects_get_by_id = async (req, res, next) => {
  const projects = await Project.findById(req.params.id).exec();
  res.send(projects);
};

module.exports.projects_post = (req, res, next) => {
  const project = new Project(req.body);
  project.save((err, project) => {
    if (err) {
      next(err);
      return;
    }
    res.send(project);
  });
};

module.exports.projects_put = (req, res, next) => {
  Project.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }, (err, project) => {
    if (err) {
      next(err);
      return;
    }
    res.send(project);
  });
};

module.exports.projects_delete = (req, res, next) => {
  Project.findByIdAndRemove(req.params.id, (err) => {
    if (err) {
      next(err);
      return;
    }
    res.send({ status: 'OK' });
  });
};

module.exports.projects_upload = (req, res, next) => {
  res.send(req.file);
};