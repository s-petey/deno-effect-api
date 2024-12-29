import { HttpApi, OpenApi } from '@effect/platform';
import { UsersRoutes } from './users/users.routes.ts';

export class EffectApi extends HttpApi.make('effectApi')
  .add(UsersRoutes)
  // add an OpenApi title & description
  .annotateContext(
    OpenApi.annotations({
      title: 'Example deno - Effect API',
    })
  ) {}
