const express = require('express');
const cors = require('cors');

const app = express;
const mongoose = require('mongoose');
const { MONGO_DB_CONFIG } = require('./config/app.config');
const http = require('http');
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
const server = http.createServer(app);
const { initMeetingServer } = require('./meeting-server');

initMeetingServer(server);

mongoose.Promise = global.Promise;
mongoose
  .connect(MONGO_DB_CONFIG.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Database Connected');
  }),
  (error) => {
    console.log(`Database can't be connected`);
  };

app.use('/api', require('./routes/app.routes'));

server.listen(process.env.port || 4000, () => {
  console.log('Ready!');
});
