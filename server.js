const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static HTML/JS from /public
app.use(express.static(path.join(__dirname, 'public')));

// Multer setup: files go to memory
const upload = multer({ storage: multer.memoryStorage() });

// Endpoint for teacher to upload a .txt
app.post('/upload', upload.single('bookfile'), (req, res) => {
  if (!req.file) return res.status(400).send('No file');
  const text = req.file.buffer.toString('utf8');
  // Broadcast to all students
  io.emit('newText', text);
  res.sendStatus(200);
});

// When a teacher edits text manually
io.on('connection', socket => {
  socket.on('editText', newText => {
    io.emit('newText', newText);
  });

  socket.on('scroll', pos => {
    socket.broadcast.emit('scroll', pos);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));

