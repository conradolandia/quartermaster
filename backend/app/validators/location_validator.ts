import vine from '@vinejs/vine'

/**
 * Validation schema for creating a location
 */
export const createLocationValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(255),
  })
)

/**
 * Validation schema for updating a location
 */
export const updateLocationValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(255).optional(),
  })
) 