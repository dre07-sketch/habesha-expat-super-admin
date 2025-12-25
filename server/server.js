require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const { DB_TYPE } = require('../server/connection/db');
const articleRouter = require('./router/article');
const JobsRouter = require('./router/job');
const eventRouter = require('./router/event');
const adNewsRouter = require('./router/ad&news');
const usersRouter = require('./router/users');
const settingRouter = require('./router/setting');
const contentRouter = require('./router/content');
const dashboardRouter = require('./router/Dashboard');
const LoginRouter = require('./auth/login');
const auditLogsRouter = require('./router/audit-logs');
const forgotPasswordRouter = require('./auth/forgetpass');

const app = express();
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use(helmet()); // Secure Headers

// Rate Limiter for Login (Strict: 5 attempts per 15 mins)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login requests per windowMs
    message: { error: "Too many login attempts, please try again after 15 minutes" },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// General API Rate Limiter (100 requests per 15 mins)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: { error: "Too many requests, please try again later" }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/upload', express.static(path.join(__dirname, 'upload')));

//---------auth----------
app.use('/api/login', loginLimiter, LoginRouter);
app.use('/api/forget-password', forgotPasswordRouter);

//--------apis (Protected)----------
// Middleware applied here prevents access without valid token
const verifyToken = require('./middleware/auth');

app.use('/api/articles', apiLimiter, verifyToken, articleRouter);
app.use('/api/jobs', apiLimiter, verifyToken, JobsRouter);
app.use('/api/events', apiLimiter, verifyToken, eventRouter);
app.use('/api/ad-news', apiLimiter, verifyToken, adNewsRouter);
app.use('/api/users', apiLimiter, verifyToken, usersRouter);
app.use('/api/settings', apiLimiter, verifyToken, settingRouter);
app.use('/api/contents', apiLimiter, verifyToken, contentRouter);
app.use('/api/audit', apiLimiter, verifyToken, auditLogsRouter);
app.use('/api/dashboard', apiLimiter, verifyToken, dashboardRouter);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Connected to ${DB_TYPE === 'mysql' ? 'MySQL' : 'PostgreSQL'} database.`);
});