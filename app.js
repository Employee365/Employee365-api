const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cors = require('cors');
const compression = require('compression');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

// Express app
const app = express();

// Trust Proxy
// app.enable('trust proxy');

// IMPLEMENTING CORS
app.use(cors());

// Helmet
// app.use(helmet());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        scriptSrc: ["'self'", 'https://cdnjs.cloudflare.com'],
      },
    },
  })
);

// Morgan - Development Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate Limiter
const limiter = rateLimit({
  max: 50,
  windowMs: 60 * 60 * 1000,
  message:
    'Too many requests from this IP. For security reasons, please try again in an hour!',
});
app.use('/api', limiter);

//Body Parser (Limit amount of data passed into body)
app.use(express.json({ limit: '10kb' }));

// Parse form data
app.use(
  express.urlencoded({
    extended: true,
    limit: '10kb',
  })
);

// Parse cookies
app.use(cookieParser());

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

// Prevent Parameter Pollution
app.use(hpp());

app.use(compression());

//CUSTOM MIDDLEWARE - Track Request time
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// Routers
app.use('/api/v1/users', userRouter);

//START ERROR HANDLING
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

module.exports = app;
