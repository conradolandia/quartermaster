declare module '@adonisjs/static/static_provider' {
  import type { ApplicationService } from '@adonisjs/core/types'

  export default class StaticProvider {
    constructor(app: ApplicationService)
    register(): void
  }
}

declare module '@adonisjs/static/static_middleware' {
  import type { NextFn } from '@adonisjs/core/types/http'
  import type { HttpContext } from '@adonisjs/core/http'

  export default class StaticMiddleware {
    constructor(publicPath: string, config: any)
    handle(ctx: HttpContext, next: NextFn): Promise<void>
  }
}

declare module '@adonisjs/static' {
  export interface StaticConfig {
    enabled?: boolean
    etag?: boolean
    lastModified?: boolean 
    dotFiles?: 'ignore' | 'allow' | 'deny'
    maxAge?: string | number
    immutable?: boolean
  }

  export function defineConfig(config: StaticConfig): StaticConfig
} 