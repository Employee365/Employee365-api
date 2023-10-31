const express = require('express');
const morgan = require('morgan');

const app = express();

// Morgan - Development Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Body Parser (Limit amount of data passed into body)
app.use(express.json({ limit: '10kb' }));

module.exports = app;
