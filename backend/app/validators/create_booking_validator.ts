import vine from '@vinejs/vine'
import { ItemType } from '#models/booking_item'

/**
 * Validator for creating a new booking.
 */
export const createBookingValidator = vine.compile(
  vine.object({
    missionId: vine.string().uuid(),
    userName: vine.string().minLength(1).maxLength(255),
    userEmail: vine.string().email(),
    userPhone: vine.string().minLength(5).maxLength(50), // Basic validation
    billingAddress: vine.string().minLength(10), // Basic validation
    specialRequests: vine.string().optional(),
    launchUpdatesPreference: vine.boolean().optional(),
    tipAmount: vine.number().min(0).optional(), // Ensure tip is not negative
    items: vine.array(
      vine.object({
        tripId: vine.string().uuid(),
        boatId: vine.string().uuid(),
        itemType: vine.enum(Object.values(ItemType)), // Validate against ItemType enum
        quantity: vine.number().min(1), // Ensure quantity is positive
      })
    ).minLength(1), // Ensure at least one item is provided
  })
) 