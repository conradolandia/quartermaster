import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { AdminRole } from '#models/admin_user'

/**
 * Admin auth middleware for protecting admin-only routes
 */
export class AdminAuthMiddleware {
  /**
   * Handle request for admin users
   */
  async handle(ctx: HttpContext, next: NextFn) {
    try {
      // Authenticate using admin guard
      await ctx.auth.use('admin').authenticate()
      return next()
    } catch (error) {
      return ctx.response.unauthorized({ error: 'Admin authentication required' })
    }
  }
}

/**
 * Check if admin has required role
 */
export function checkAdminRole(role: AdminRole) {
  return async (ctx: HttpContext, next: NextFn) => {
    try {
      // Authenticate first
      await ctx.auth.use('admin').authenticate()
      
      const admin = ctx.auth.use('admin').user!
      
      if (admin.role !== role) {
        return ctx.response.forbidden({ error: 'Insufficient permissions' })
      }
      
      return next()
    } catch (error) {
      return ctx.response.unauthorized({ error: 'Admin authentication required' })
    }
  }
}