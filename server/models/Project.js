const mongoose = require('mongoose');

const projectSchema = mongoose.Schema({
  name: String,
  sourceDataset: { type: mongoose.Schema.Types.Mixed, default: {} }, // { type: mongoose.Schema.Types.ObjectId, ref: 'Dataset'},
  targetDataset: { type: mongoose.Schema.Types.Mixed, default: {} }, // { type: mongoose.Schema.Types.ObjectId, ref: 'Dataset'},
  alignments: { type: mongoose.Schema.Types.Mixed, default: {} },
  selectedSourceRdfType: String,
  selectedTargetRdfType: String,
  selectedRdfProperties: [mongoose.Schema.Types.Mixed],
}, {
  versionKey: false,
  minimize: false, // save empty objects
});

projectSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    ret.id = ret._id;
    delete ret._id;
  }
});

module.exports = mongoose.model('Project', projectSchema);