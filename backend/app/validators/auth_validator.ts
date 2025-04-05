import vine from '@vinejs/vine'

/**
 * Validation schema for user registration
 */
export const registerValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string().minLength(8),
    fullName: vine.string().trim().minLength(3).maxLength(255).optional(),
    role: vine.enum(['admin', 'customer', 'operator']).optional(),
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