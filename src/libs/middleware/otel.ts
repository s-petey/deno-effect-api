import { NodeSdk } from '@effect/opentelemetry';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-base';

let spanExporter: OTLPTraceExporter | ConsoleSpanExporter =
  new ConsoleSpanExporter();

if (Deno.env.get('NODE_ENV') === 'production') {
  const otelKey = Deno.env.get('BASELIME_KEY');

  if (!otelKey) {
    throw new Error('Missing BASELIME_KEY env variable');
  }

  spanExporter = new OTLPTraceExporter({
    url: 'https://otel.baselime.io/v1/traces',
    headers: {
      'x-api-key': otelKey,
      'Content-Type': 'application/json',
      'x-service': 'deno-effect-api',
    },
  });
}

// Set up tracing with the OpenTelemetry SDK
export const OtelNodeHandler = NodeSdk.layer(() => ({
  resource: { serviceName: 'deno-effect-api' },
  // Export span data to the console
  spanProcessor: new BatchSpanProcessor(spanExporter),
  instrumentations: [getNodeAutoInstrumentations()],
}));
