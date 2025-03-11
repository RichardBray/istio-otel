import express from 'express';
import { MongoClient } from 'mongodb';
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
const port = 5000;
const mongoUrl = 'mongodb://mongodb:27017';
const dbName = 'products';
let db;

// Connect to MongoDB
async function connectToMongo() {
  try {
    const client = new MongoClient(mongoUrl);
    await client.connect();
    db = client.db(dbName);
    console.log('Connected to MongoDB');

    // Initialize with sample data if collection is empty
    const count = await db.collection('products').countDocuments();
    if (count === 0) {
      await db.collection('products').insertMany([
        { name: 'Product 1', price: 10.99 },
        { name: 'Product 2', price: 24.99 },
        { name: 'Product 3', price: 5.99 }
      ]);
      console.log('Sample products initialized');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

connectToMongo();

app.get('/', (_req, res) => {
  res.send('Backend Service');
});

app.get('/api/products', async (_req, res) => {
  try {
    // Add custom delay to simulate database processing
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200));

    // Occasional deliberate error for testing error tracking
    if (Math.random() < 0.1) {
      throw new Error('Random backend error');
    }

    const products = await db.collection('products').find().toArray();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Backend service listening at http://localhost:${port}`);
});