import { HttpApiBuilder, HttpApiGroup } from '@effect/platform';
import { DateTime, Effect, Layer } from 'effect';
import { pipe } from 'effect/Function';
import { users } from '../libs/db.ts';
import { EffectApi } from '../schemas.ts';
import { User, UserExists, UserNotFound } from './users.schemas.ts';
import { LoggerHandler } from '../libs/middleware/logging.ts';

// Docs
// https://github.com/Effect-TS/effect/tree/main/packages/platform

// the `HttpApiBuilder.group` api returns a `Layer`
export const UsersHandlers: Layer.Layer<
  HttpApiGroup.ApiGroup<(typeof EffectApi)['identifier'], 'users'>
> = HttpApiBuilder.group(EffectApi, 'users', (handlers) =>
  handlers
    .handle('findById', ({ path: { userId } }) => {
      return pipe(
        Effect.gen(function* () {
          yield* Effect.sleep('1 seconds');

          const user = users.find((u) => u.id === userId);

          if (!user) {
            return Effect.fail(UserNotFound);
          }

          return Effect.succeed(user);
        }),
        // Optionally add additional information to the current span
        Effect.tap(() => Effect.annotateCurrentSpan('info', 'find user')),
        Effect.flatten,
        Effect.mapError(() => new UserNotFound())
      );
    })

    .handle('findMany', () =>
      pipe(
        Effect.gen(function* () {
          yield* Effect.sleep('0.5 seconds');
          return Effect.succeed(users);
        }),

        Effect.flatten
      )
    )
    .handle('create', ({ payload }) =>
      pipe(
        Effect.gen(function* () {
          yield* Effect.sleep('0.5 seconds');
          const user = users.find((u) => u.name === payload.name);

          if (user) {
            return Effect.fail(UserExists);
          }

          const newUser: User = {
            ...payload,
            id: users.length + 1,
            createdAt: DateTime.unsafeNow(),
          };

          users.push(newUser);

          return Effect.succeed(newUser);
        }),
        Effect.flatten,
        Effect.mapError(() => new UserExists())
      )
    )
    .handle('update', ({ path: { userId }, payload }) =>
      pipe(
        Effect.gen(function* () {
          yield* Effect.sleep('0.5 seconds');
          const userIndex = users.findIndex((u) => u.id === userId);

          if (userIndex < 0) {
            return Effect.fail(UserNotFound);
          }

          const user = users[userIndex];

          const updatedUser = {
            ...user,
            ...payload,
          };

          users[userIndex] = updatedUser;

          return Effect.succeed(updatedUser);
        }),
        Effect.flatten,
        Effect.mapError(() => new UserNotFound())
      )
    )
    .handle('delete', ({ path: { userId } }) =>
      pipe(
        Effect.gen(function* () {
          yield* Effect.sleep('0.5 seconds');
          const user = users.find((u) => u.id === userId);

          if (!user) {
            return Effect.fail(UserNotFound);
          }

          users.splice(users.indexOf(user), 1);

          return Effect.succeed(user);
        })
      )
    )
).pipe(Layer.provide(LoggerHandler));
