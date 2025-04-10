import vine from '@vinejs/vine'
import { ItemType } from '#models/booking_item'

/**
 * Validation schema for creating a booking
 */
export const createBookingValidator = vine.compile(
  vine.object({
    missionId: vine.string().uuid(),
    userName: vine.string().trim().minLength(3).maxLength(255),
    userEmail: vine.string().email(),
    userPhone: vine.string(),
    billingAddress: vine.string(),
    tipAmount: vine.number().min(0).optional(),
    specialRequests: vine.string().trim().optional(),
    items: vine.array(
      vine.object({
        tripId: vine.string().uuid(),
        boatId: vine.string().uuid(),
        itemType: vine.enum(Object.values(ItemType)),
        quantity: vine.number().positive().min(1)
      })
    ).minLength(1)
  })
)

/**
 * Validation schema for updating a booking
 */
export const updateBookingValidator = vine.compile(
  vine.object({
    userName: vine.string().trim().minLength(3).maxLength(255).optional(),
    userEmail: vine.string().email().optional(),
    userPhone: vine.string().trim().optional(),
    billingAddress: vine.string().optional(),
    tipAmount: vine.number().min(0).optional(),
    specialRequests: vine.string().trim().optional(),
  })
) 