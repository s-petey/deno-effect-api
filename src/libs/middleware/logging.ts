import { HttpApiMiddleware, HttpServerRequest } from '@effect/platform';
import { Effect, Layer, Schema, Logger as EffectLogger } from 'effect';

class LoggerError extends Schema.TaggedError<LoggerError>()(
  'LoggerError',
  {}
) {}

// first extend the HttpApiMiddleware.Tag class
export class Logger extends HttpApiMiddleware.Tag<Logger>()('Http/Logger', {
  // optionally define any errors that the middleware can return
  failure: LoggerError,
}) {}

export const LoggerHandler = Layer.effect(
  Logger,
  Effect.gen(function* () {
    yield* Effect.log('creating Logger middleware');

    // standard middleware is just an Effect, that can access the `HttpRouter`
    // context.
    return Logger.of(
      Effect.gen(function* () {
        const request = yield* HttpServerRequest.HttpServerRequest;
        // yield* Effect.log(EffectLogger.pretty);
        yield* Effect.log(`Request: ${request.method} ${request.url}`);
      })
    );
  })
);
