import type { HttpContext } from '@adonisjs/core/http'
import AdminUser, { AdminRole } from '#models/admin_user'
import { loginValidator, adminRegisterValidator } from '#validators/auth_validator'
import hash from '@adonisjs/core/services/hash'

export default class AuthController {
  /**
   * Register a new admin user
   */
  async registerAdmin({ request, response }: HttpContext) {
    const payload = await request.validateUsing(adminRegisterValidator)
    
    // Check if admin already exists
    const existingAdmin = await AdminUser.findBy('email', payload.email)
    if (existingAdmin) {
      return response.conflict({ error: 'Admin with this email already exists' })
    }
    
    // Create the admin user
    const admin = await AdminUser.create({
      email: payload.email,
      password: await hash.make(payload.password),
      name: payload.name,
      role: payload.role as AdminRole,
    })
    
    // Generate API token
    const token = await AdminUser.accessTokens.create(admin)
    
    return response.created({
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
      token: token.value,
    })
  }
  
  /**
   * Log in an admin user
   */
  async loginAdmin({ request, response }: HttpContext) {
    const payload = await request.validateUsing(loginValidator)
    
    try {
      console.log(`Attempting login for: ${payload.email}`)
      
      // Find the admin user first
      const admin = await AdminUser.findBy('email', payload.email)
      
      // If admin not found, return unauthorized
      if (!admin) {
        console.log(`Admin user not found: ${payload.email}`)
        return response.unauthorized({ error: 'Invalid credentials' })
      }
      
      console.log(`Admin found: ${admin.email}, Verifying password...`)
      console.log(`Stored password hash: ${admin.password.substring(0, 15)}...`)
      
      // Verify password - IMPORTANT: hash.verify takes (hashedValue, plainTextValue)
      const isPasswordValid = await hash.verify(admin.password, payload.password)
      
      console.log(`Password verification result: ${isPasswordValid}`)
      
      if (isPasswordValid) {
        // Generate API token
        const token = await AdminUser.accessTokens.create(admin)
        
        console.log(`Login successful, token generated`)
        
        return response.ok({
          admin: {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
          },
          token: token.value,
        })
      } else {
        console.log(`Password verification failed`)
        return response.unauthorized({ error: 'Invalid credentials' })
      }
    } catch (error) {
      console.error('Login error:', error)
      return response.unauthorized({ error: 'Invalid credentials' })
    }
  }
}