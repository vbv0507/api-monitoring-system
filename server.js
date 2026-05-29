const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const socket = require("./socket");

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

socket.init(io);

io.on("connection", (client) => {
  console.log("Socket connected:", client.id);

  const token = client.handshake.auth && client.handshake.auth.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      client.join(decoded.id);
      console.log("Socket joined user room:", decoded.id);
    } catch (error) {
      console.log("Socket auth error:", error.message);
    }
  }

  client.on("disconnect", () => {
    console.log("Socket disconnected:", client.id);
  });
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ROUTES
const monitorRoutes = require('./routes/monitorRoutes');
const authRoutes = require('./routes/authRoutes');
const incidentRoutes = require('./routes/incidentRoutes');

app.use('/api/monitors', monitorRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);


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

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    require('./cron/client');
});
