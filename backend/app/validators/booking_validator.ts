import vine from '@vinejs/vine'

/**
 * Validation schema for creating a booking
 */
export const createBookingValidator = vine.compile(
  vine.object({
    customerName: vine.string().trim().minLength(3).maxLength(255),
    customerEmail: vine.string().email(),
    customerPhone: vine.string().trim().optional(),
    numberOfTickets: vine.number().positive().min(1),
    status: vine.enum(['pending', 'confirmed', 'cancelled']).optional(),
    tripId: vine.string().uuid(),
    specialRequests: vine.string().trim().optional(),
  })
)

/**
 * Validation schema for updating a booking
 */
export const updateBookingValidator = vine.compile(
  vine.object({
    customerName: vine.string().trim().minLength(3).maxLength(255).optional(),
    customerEmail: vine.string().email().optional(),
    customerPhone: vine.string().trim().optional(),
    numberOfTickets: vine.number().positive().min(1).optional(),
    status: vine.enum(['pending', 'confirmed', 'cancelled']).optional(),
    tripId: vine.string().uuid().optional(),
    specialRequests: vine.string().trim().optional(),
  })
) 