const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const colors = require('colors');
const errorHandler = require('./middleware/error');
dotenv.config({ path: './config/config.env' });
const flieupload = require('express-fileupload');
const cookieParser = require('cookie-parser');

//connect to database
connectDB();
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

const app = express();

app.use(express.json());

app.use(flieupload());

// set static foler
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

//cookie parser
app.use(cookieParser());

app.use(errorHandler);
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`App listening on port ${PORT} !`.yellow.bold);
});

// Handle unhandled rejection
process.on('unhandledRejection', (err, promiss) => {
  console.log(`Error: ${err}`.red);
  server.close(() => process.exit(1));
});
