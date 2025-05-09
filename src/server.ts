//@ts-nocheck
declare module 'express' {
  export default function express(): any;
  export interface Request {
    query: any;
    body: any;
    params: any;
  }
  export interface Response {
    setHeader(name: string, value: string): void;
    status(code: number): Response;
    json(body: any): void;
    sendFile(path: string): void;
  }
}

declare module 'cors' {
  export default function cors(): any;
}

import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// 1) GET /api/echo?foo=bar
//    - Returns nested JSON, sets a custom header
//    - Query param in request.query
app.get('/api/echo', (req: Request, res: Response) => {
  const { foo = 'none' } = req.query;
  res.setHeader('X-Echo-Header', `YouSent:${foo}`);
  return res.json({
    status: 'ok',
    query: { foo },
    nested: { level1: { level2: { foo } } }
  });
});

// 2) POST /api/submit
//    - Reads JSON body, payload
//    - Returns 201, sets Content-Length header and echo payload
app.post('/api/submit', (req: Request, res: Response) => {
  const payload = req.body;
  const str = JSON.stringify(payload);
  res.setHeader('Content-Length', Buffer.byteLength(str).toString());
  res.status(201).json({ received: payload, meta: { length: str.length } });
});

// 3) GET /api/nested
//    - Returns deeply nested array + object to test deep search
app.get('/api/nested', (_req: Request, res: Response) => {
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
//    - Reads URL param and JSON body
//    - Echos both in response header and body
app.put('/api/update/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const update = req.body;
  res.setHeader('X-Updated-ID', id);
  res.setHeader('X-Update-Status', 'success');
  res.json({ updatedId: id, update });
});

// Fallback for client
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
