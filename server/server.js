require('dotenv').config();
const express = require('express');
const cors = require('cors');
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


//--------apis----------
app.use('/api/articles', articleRouter);
app.use('/api/jobs', require('./router/job'));
app.use('/api/events', require('./router/event'));
app.use('/api/ad-news', require('./router/ad&news'));
app.use('/api/users', require('./router/users'));
app.use('/api/settings', require('./router/setting'));
app.use('/api/contents', require('./router/content'))













const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Connected to ${DB_TYPE === 'mysql' ? 'MySQL' : 'PostgreSQL'} database.`);
});