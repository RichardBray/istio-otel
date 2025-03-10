import express from 'express';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

if (process.env.OTEL_ENABLED === 'true') {
  console.log('Initializing OpenTelemetry...');

  const sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'frontend-service',
    }),
    traceExporter: new OTLPTraceExporter({
      url: 'http://otel-collector:4318/v1/traces',
    }),
    instrumentations: [getNodeAutoInstrumentations()],
  });

  sdk.start();

  process.on('SIGTERM', () => {
    sdk.shutdown()
      .then(() => console.log('OpenTelemetry SDK shut down successfully'))
      .catch((error) => console.log('Error shutting down OpenTelemetry SDK', error))
      .finally(() => process.exit(0));
  });
}

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