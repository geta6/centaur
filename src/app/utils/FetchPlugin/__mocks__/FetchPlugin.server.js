import express from 'express';
import httpMocks from 'node-mocks-http';

const route = express();

route.get('/api/items/:id', (req, res) => {
  res.json({ id: req.params.id });
});

export default (options = {}) => {
  const res = httpMocks.createResponse();
  route.handle(httpMocks.createRequest(options), res);
  return res;
};
