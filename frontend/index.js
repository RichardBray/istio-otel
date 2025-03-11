import express from 'express';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

const otelCollectorUrl = 'http://otel-collector.observability.svc.cluster.local:4318';

const sdk = new NodeSDK({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: 'backend-service',
  }),
  traceExporter: new OTLPTraceExporter({
    url: `${otelCollectorUrl}/v1/traces`,
    tls: {
      insecure: true
    }
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: `${otelCollectorUrl}/v1/metrics`,
      tls: {
        insecure: true
      }
    }),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

const app = express();
const port = 3000;

app.get('/', (_req, res) => {
  res.send('Frontend Service');
});

app.get('/products', async (_req, res) => {
  try {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100));

    const response = await fetch('http://backend:5000/api/products');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error calling backend:', error.message);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.listen(port, () => {
  console.log(`Frontend service listening at http://localhost:${port}`);
});