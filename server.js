const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 1) GET /api/echo?foo=bar
app.get('/api/echo', (req, res) => {
  const { foo = 'none' } = req.query;
  res.setHeader('X-Echo-Header', `YouSent:${foo}`);
  return res.json({
    status: 'ok',
    query: { foo },
    nested: { level1: { level2: { foo } } }
  });
});

// 2) POST /api/submit
app.post('/api/submit', (req, res) => {
  const payload = req.body;
  const str = JSON.stringify(payload);
  res.setHeader('Content-Length', Buffer.byteLength(str).toString());
  res.status(201).json({ received: payload, meta: { length: str.length } });
});

// 3) GET /api/nested
app.get('/api/nested', (_req, res) => {
  const data = {
    users: [
      { id: 'u1', name: 'Alice', attrs: { age: 30, roles: ['admin', 'user'] } },
      { id: 'u2', name: 'Bob',   attrs: { age: 25, roles: ['user'] } }
    ],
    metrics: { count: 2, keys: ['id', 'name'] }
  };
  res.setHeader('X-Metrics-Header', 'Count:2');
  res.json(data);
});

// 4) PUT /api/update/:id
app.put('/api/update/:id', (req, res) => {
  const { id } = req.params;
  const update = req.body;
  res.setHeader('X-Updated-ID', id);
  res.setHeader('X-Update-Status', 'success');
  res.json({ updatedId: id, update });
});

// Fallback for client
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));