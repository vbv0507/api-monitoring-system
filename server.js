const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ROUTES
const monitorRoutes = require('./routes/monitorRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/monitors', monitorRoutes);
app.use('/api/auth', authRoutes);


// TEST ROUTE
app.get('/', (req, res) => {
    res.render('home');
});



// DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('MongoDB Connected');
})
.catch((err) => {
    console.log(err);
});

require('./cron/monitorCron');

// SERVER
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
