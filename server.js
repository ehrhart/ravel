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
mongoose.connect('mongodb://heroku_7v4zmqv5:bs7ugjljhocfcmamddbtr32k9b@ds113586.mlab.com:13586/heroku_7v4zmqv5', {
  useNewUrlParser: true,
  autoReconnect: true,
});
mongoose.connection.on('error', error => {
  console.error('Database connection error:', error);
});
mongoose.connection.once('open', () => {
  console.log('Connected to Database!');
});