import type { HttpContext } from '@adonisjs/core/http'
import User, { UserRole } from '#models/user'
import { registerValidator, loginValidator } from '#validators/auth_validator'
import hash from '@adonisjs/core/services/hash'

export default class AuthController {
  /**
   * Register a new user
   */
  async register({ request, response }: HttpContext) {
    const payload = await request.validateUsing(registerValidator)
    
    // Check if user already exists
    const existingUser = await User.findBy('email', payload.email)
    if (existingUser) {
      return response.conflict({ error: 'User with this email already exists' })
    }
    
    // Create the user
    const user = await User.create({
      email: payload.email,
      password: await hash.make(payload.password),
      fullName: payload.fullName,
      role: (payload.role as UserRole) || UserRole.CUSTOMER,
      isActive: true,
    })
    
    // Generate API token
    const token = await User.accessTokens.create(user)
    
    return response.created({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      token: token.value,
    })
  }

  /**
   * Log in an existing user
   */
  async login({ request, response }: HttpContext) {
    const payload = await request.validateUsing(loginValidator)
    
    try {
      // Find and verify user
      const user = await User.verifyCredentials(payload.email, payload.password)
      
      // Check if user is active
      if (!user.isActive) {
        return response.unauthorized({ error: 'Your account has been deactivated' })
      }
      
      // Generate API token
      const token = await User.accessTokens.create(user)
      
      return response.ok({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
        token: token.value,
      })
    } catch (error) {
      return response.unauthorized({ error: 'Invalid credentials' })
    }
  }
}