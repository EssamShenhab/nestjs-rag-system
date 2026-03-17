import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Counter, Histogram } from 'prom-client';

const REQUEST_COUNT = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP Requests',
  labelNames: ['method', 'endpoint', 'status'],
});

const REQUEST_LATENCY = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP Request Latency',
  labelNames: ['method', 'endpoint'],
});

@Injectable()
export class PrometheusMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const endpoint = req.path;

    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000;

      REQUEST_LATENCY.labels(req.method, endpoint).observe(duration);
      REQUEST_COUNT.labels(req.method, endpoint, String(res.statusCode)).inc();
    });

    next();
  }
}
