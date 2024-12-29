import { Schema } from 'effect';

// Our domain "User" Schema
export const User = Schema.Struct({
  id: Schema.NonNegativeInt,
  name: Schema.NonEmptyString,
  createdAt: Schema.DateTimeUtc,
});

export type User = Schema.Schema.Type<typeof User>;

// define the error schemas
export class UserNotFound extends Schema.TaggedError<UserNotFound>()(
  'UserNotFound',
  {}
) {}

export class UserExists extends Schema.TaggedError<UserExists>()(
  'UserExists',
  {}
) {}
