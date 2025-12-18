require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const { DB_TYPE } = require('../server/connection/db');
const articleRouter = require('./router/article');
const JobsRouter = require('./router/job');
const eventRouter = require('./router/event');
const adNewsRouter = require('./router/ad&news');
const usersRouter = require('./router/users');
const settingRouter = require('./router/setting');
const contentRouter = require('./router/content');

const app = express();  
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//--------apis----------
app.use('/api/articles', articleRouter);
app.use('/api/jobs', JobsRouter);
app.use('/api/events', eventRouter);
app.use('/api/ad-news', adNewsRouter);
app.use('/api/users', usersRouter);
app.use('/api/settings', settingRouter);
app.use('/api/contents', contentRouter)


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Connected to ${DB_TYPE === 'mysql' ? 'MySQL' : 'PostgreSQL'} database.`);
});