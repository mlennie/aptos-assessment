const express = require('express');
const path = require('path');
process.env.SUPPRESS_NO_CONFIG_WARNING = process.env.SUPPRESS_NO_CONFIG_WARNING || 'true';
require('dotenv').config();

const app = express();

// Connect Database
// connectDB();

// Init Middleware
app.use(express.json());

// Define Routes
app.use('/api/users', require('./server/routes/api/users'));
app.use('/api/auth', require('./server/routes/api/auth'));
// TODO: re-enable once normalize-url is migrated to dynamic import() or pinned to v8
// app.use('/api/profile', require('./server/routes/api/profile'));
app.use('/api/posts', require('./server/routes/api/posts'));
app.use('/api/notes', require('./server/routes/api/notes'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('dist'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 5025;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
