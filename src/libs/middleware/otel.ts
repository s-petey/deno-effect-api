import { NodeSdk } from '@effect/opentelemetry';
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-base';

// TODO:
// Skipped example below in favor of otel.
// https://github.com/Effect-TS/effect/tree/main/packages/platform#middleware-requesttime

// Set up tracing with the OpenTelemetry SDK
export const OtelNodeHandler = NodeSdk.layer(() => ({
  resource: { serviceName: 'deno-effect-api' },
  // Export span data to the console
  spanProcessor: new BatchSpanProcessor(new ConsoleSpanExporter()),
}));
