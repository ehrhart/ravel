const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Configure
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Routes
const apiRouter = require('./server/routes/api.route');
app.use('/api', apiRouter);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

app.listen(port, () => console.log(`Listening on port ${port}`));

// Connecting to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ravel', {
  useNewUrlParser: true,
  autoReconnect: true,
});
mongoose.connection.on('error', error => {
  console.error('Database connection error:', error);
});
mongoose.connection.once('open', () => {
  console.log('Connected to Database!');
});