import vine from '@vinejs/vine'
import { TripType } from '#models/trip'

/**
 * Validation schema for creating a trip
 */
export const createTripValidator = vine.compile(
  vine.object({
    mission_id: vine.string().uuid(),
    type: vine.enum(Object.values(TripType) as string[]).optional(),
    departure_time: vine.string().optional(),
    boarding_time: vine.string().optional(),
    check_in_time: vine.string().optional(),
    active: vine.boolean().optional(),
  })
)

/**
 * Validation schema for updating a trip
 */
export const updateTripValidator = vine.compile(
  vine.object({
    mission_id: vine.string().uuid().optional(),
    type: vine.enum(Object.values(TripType) as string[]).optional(),
    departure_time: vine.string().optional(),
    boarding_time: vine.string().optional(),
    check_in_time: vine.string().optional(),
    active: vine.boolean().optional(),
  })
) 