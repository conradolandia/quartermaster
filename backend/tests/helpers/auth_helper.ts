import AdminUser, { AdminRole } from '#models/admin_user'
import hash from '@adonisjs/core/services/hash'

/**
 * Login payload for admin user tests
 */
export const adminLoginPayload = {
  email: 'admin@example.com',
  password: 'admin123',
}

/**
 * Create a test admin for authentication tests
 */
export async function createAdminUser() {
  const admin = await AdminUser.create({
    email: adminLoginPayload.email,
    password: await hash.make(adminLoginPayload.password),
    name: 'Admin User',
    role: AdminRole.ADMIN,
  })
  
  return admin
}

/**
 * Create a test admin and generate a token
 */
export async function createAdminWithToken() {
  const admin = await createAdminUser()
  const token = await AdminUser.accessTokens.create(admin)
  return { admin, token: token.value }
}

/**
 * Create a real admin user in the database
 * Use this for seeding an initial admin account
 */
export async function seedAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await AdminUser.findBy('email', 'admin@starfleet.com')
    if (existingAdmin) {
      console.log('Admin user already exists')
      return existingAdmin
    }
    
    // Generate the password hash directly
    const password = 'AdminStarfleet123!'
    const hashedPassword = await hash.make(password)
    
    console.log('Creating admin user with password hash:', hashedPassword.substring(0, 10) + '...')
    
    // Create the admin
    const admin = await AdminUser.create({
      email: 'admin@starfleet.com',
      password: hashedPassword,
      name: 'Star Fleet Admin',
      role: AdminRole.ADMIN,
    })
    
    console.log('Admin user created:', admin.email)
    return admin
  } catch (error) {
    console.error('Failed to seed admin user:', error)
    throw error
  }
}

/**
 * Create a test admin with a unique email for tests
 */
export async function createUniqueAdminWithToken() {
  const uniqueEmail = `admin_${Date.now()}@example.com`
  const admin = await AdminUser.create({
    email: uniqueEmail,
    password: await hash.make(adminLoginPayload.password),
    name: 'Admin User',
    role: AdminRole.ADMIN,
  })
  
  const token = await AdminUser.accessTokens.create(admin)
  return { admin, token: token.value }
} 