import vine from '@vinejs/vine'
import { AdminRole } from '#models/admin_user'
import { UserRole } from '#models/user'

/**
 * Validation schema for user registration
 */
export const registerValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string().minLength(8),
    fullName: vine.string().trim().minLength(3).maxLength(255).optional(),
    role: vine.enum(Object.values(UserRole)).optional(),
  })
)

/**
 * Validation schema for admin user registration
 */
export const adminRegisterValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string().minLength(8),
    name: vine.string().trim().minLength(3).maxLength(255),
    role: vine.enum(Object.values(AdminRole)),
  })
)

/**
 * Validation schema for user login
 */
export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string(),
  })
) 