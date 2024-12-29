import {
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema,
  OpenApi,
} from '@effect/platform';
import { Schema } from 'effect';
import { User, UserExists, UserNotFound } from './users.schemas.ts';
import { Logger } from '../libs/middleware/logging.ts';

// Our user id path parameter schema
const UserIdParam = HttpApiSchema.param('userId', Schema.NumberFromString);

export const UsersRoutes = HttpApiGroup.make('users')
  .add(
    HttpApiEndpoint.get('findMany', '/users')
      // the endpoint can have a Schema for a successful response
      .addSuccess(Schema.Array(User))
  )
  .add(
    // each endpoint has a name and a path
    // You can use a template string to define path parameter schemas
    HttpApiEndpoint.get('findById')`/users/${UserIdParam}`
      // here we are adding our error response
      .addError(UserNotFound, { status: 404 })
      // the endpoint can have a Schema for a successful response
      .addSuccess(User)
  )
  .add(
    // you can also pass the path as a string and use `.setPath` to define the
    // path parameter schema
    HttpApiEndpoint.post('create', '/users')
      // here we are adding our error response
      .addError(UserExists, { status: 400 })
      .addSuccess(User)
      // and here is a Schema for the request payload / body
      //
      // this is a POST request, so the payload is in the body
      // but for a GET request, the payload would be in the URL search params
      .setPayload(User.omit('id', 'createdAt'))
  )
  // by default, the endpoint will respond with a 204 No Content
  .add(
    HttpApiEndpoint.del('delete')`/users/${UserIdParam}`
      // here we are adding our error response
      .addError(UserNotFound, { status: 404 })
  )
  .add(
    HttpApiEndpoint.patch('update')`/users/${UserIdParam}`
      // here we are adding our error response
      .addError(UserNotFound, { status: 404 })
      .addSuccess(User)
      .setPayload(
        Schema.Struct({
          name: Schema.String,
        })
      )
  )
  .annotateContext(
    // add an OpenApi title & description
    OpenApi.annotations({
      title: 'Users API',
      description: 'API for managing users',
    })
  )
  .middleware(Logger);
// or we could add an error to the group
// TODO: Implement later -- follow docs
// https://github.com/Effect-TS/effect/tree/main/packages/platform#implementing-httpapisecurity-middleware
// .addError(Unauthorized, { status: 401 });

// TODO: skipped
// https://github.com/Effect-TS/effect/tree/main/packages/platform#middleware-requesttime
