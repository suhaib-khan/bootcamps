const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

//loading dotenv configuration
dotenv.config({ path: './config/config.env' });

// connect DB

connectDB();
const app = express();

// body parser
app.use(express.json());


//Routes
const bootcamps = require('./routes/bootcamps');


// dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//Mouting routers
app.use('/api/v1/bootcamps', bootcamps);

// bringing in error middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
    PORT,
    console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow
            .bold
    )
);

// handling unhandled promise rejections

process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);

    //close server and exit
    server.close(() => process.exit(1));
});
