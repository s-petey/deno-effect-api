import { HttpApiBuilder, HttpApiGroup } from '@effect/platform';
import { DateTime, Duration, Effect, Layer, Random } from 'effect';
import { pipe } from 'effect/Function';
import { users } from '../libs/db.ts';
import { EffectApi } from '../schemas.ts';
import { User, UserExists, UserNotFound } from './users.schemas.ts';
import { LoggerHandler } from '../libs/middleware/logging.ts';

// Docs
// https://github.com/Effect-TS/effect/tree/main/packages/platform

const RandomSleep = Effect.gen(function* () {
  const randomWait = yield* Random.nextRange(0.5, 2);

  yield* Effect.sleep(Duration.seconds(randomWait)).pipe(
    Effect.tap(() => Effect.log(`Sleeping for ${randomWait}`))
  );
});

// the `HttpApiBuilder.group` api returns a `Layer`
export const UsersHandlers: Layer.Layer<
  HttpApiGroup.ApiGroup<(typeof EffectApi)['identifier'], 'users'>
> = HttpApiBuilder.group(EffectApi, 'users', (handlers) =>
  handlers
    .handle('findById', ({ path: { userId } }) => {
      return pipe(
        Effect.gen(function* () {
          yield* RandomSleep;

          const user = users.find((u) => u.id === userId);

          if (!user) {
            throw new UserNotFound();
          }

          return user;
        }),
        // Optionally add additional information to the current log
        Effect.annotateLogs({ endpoint: 'findById', method: 'GET', userId })
      );
    })

    .handle('findMany', () =>
      pipe(
        Effect.gen(function* () {
          yield* RandomSleep;
          return users;
        }),
        Effect.annotateLogs({ endpoint: 'findMany', method: 'GET' })
      )
    )
    .handle('create', ({ payload }) =>
      pipe(
        Effect.gen(function* () {
          yield* RandomSleep;
          const user = users.find((u) => u.name === payload.name);

          if (user) {
            throw new UserExists();
          }

          const newUser: User = {
            ...payload,
            id: users.length + 1,
            createdAt: DateTime.unsafeNow(),
          };

          yield* Effect.log(`Created user: ${newUser.name}`);
          users.push(newUser);

          return newUser;
        }),
        Effect.annotateLogs({ endpoint: 'create', method: 'POST' })
      )
    )
    .handle('update', ({ path: { userId }, payload }) =>
      pipe(
        Effect.gen(function* () {
          yield* RandomSleep;
          const userIndex = users.findIndex((u) => u.id === userId);

          if (userIndex < 0) {
            throw new UserNotFound();
          }

          const user = users[userIndex];

          const updatedUser = {
            ...user,
            ...payload,
          };

          yield* Effect.log(`Updated user: ${updatedUser.name}`);
          users[userIndex] = updatedUser;

          return updatedUser;
        }),
        Effect.annotateLogs({ endpoint: 'update', method: 'PATCH', userId })
      )
    )
    .handle('delete', ({ path: { userId } }) =>
      pipe(
        Effect.gen(function* () {
          yield* RandomSleep;
          const user = users.find((u) => u.id === userId);

          if (!user) {
            return Effect.fail(new UserNotFound());
          }

          users.splice(users.indexOf(user), 1);

          yield* Effect.log(`Deleted user: ${user.name}`);
        }),
        Effect.annotateLogs({ endpoint: 'delete', method: 'DELETE', userId })
      )
    )
).pipe(Layer.provide(LoggerHandler));
