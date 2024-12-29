import {
  HttpApi,
  HttpApiBuilder,
  HttpApiSwagger,
  HttpMiddleware,
  HttpServer,
} from '@effect/platform';
import { NodeHttpServer, NodeRuntime } from '@effect/platform-node';
import { Layer } from 'effect';
import { createServer } from 'node:http';
import { OtelNodeHandler } from './libs/middleware/otel.ts';
import { EffectApi } from './schemas.ts';
import { UsersHandlers } from './users/users.handlers.ts';

const MyApiLive: Layer.Layer<HttpApi.Api> = HttpApiBuilder.api(EffectApi).pipe(
  Layer.provide(UsersHandlers)
);

// use the `HttpApiBuilder.serve` function to register our API with the HTTP
// server
const HttpLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  // add the swagger documentation layer
  Layer.provide(
    HttpApiSwagger.layer({
      // "/docs" is the default path for the swagger documentation
      path: '/docs',
    })
  ),
  // Add CORS middleware
  Layer.provide(HttpApiBuilder.middlewareCors()),
  // Provide the API implementation
  Layer.provide(MyApiLive),
  Layer.provide(OtelNodeHandler),
  // Log the address the server is listening on
  HttpServer.withLogAddress,
  // Provide the HTTP server implementation
  Layer.provide(NodeHttpServer.layer(createServer, { port: 3000 }))
);

// run the server
Layer.launch(HttpLive).pipe(NodeRuntime.runMain);

// TODO: Left off here...
// https://github.com/Effect-TS/effect/tree/main/packages/platform#error-handling
