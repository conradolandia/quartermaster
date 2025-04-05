import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { UserRole } from '#models/user'

/**
 * Auth middleware to protect routes
 */
export default class AuthMiddleware {
  /**
   * Handle request
   */
  async handle(ctx: HttpContext, next: NextFn) {
    try {
      // Authenticate using API tokens guard
      await ctx.auth.use('api').authenticate()
      return next()
    } catch (error) {
      return ctx.response.unauthorized({ error: 'Authentication required' })
    }
  }
}

/**
 * Check if user has required role
 */
export function checkRole(role: UserRole) {
  return async (ctx: HttpContext, next: NextFn) => {
    try {
      // Authenticate first
      await ctx.auth.use('api').authenticate()
      
      const user = ctx.auth.use('api').user!
      
      if (user.role !== role) {
        return ctx.response.forbidden({ error: 'Insufficient permissions' })
      }
      
      return next()
    } catch (error) {
      return ctx.response.unauthorized({ error: 'Authentication required' })
    }
  }
}