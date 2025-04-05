import type { HttpContext } from '@adonisjs/core/http'
import Booking, { BookingStatus } from '#models/booking'
import { v4 as uuidv4 } from 'uuid'

export default class BookingsController {
  /**
   * Display a list of all bookings
   */
  async index({ response }: HttpContext) {
    const bookings = await Booking.query()
      .preload('mission')
      .preload('bookingItems', (query) => {
        query.preload('trip')
      })
    return response.json(bookings)
  }

  /**
   * Display a specific booking
   */
  async show({ params, response }: HttpContext) {
    const { id } = params
    const booking = await Booking.findOrFail(id)
    await booking.load('mission')
    await booking.load('bookingItems', (query) => {
      query.preload('trip')
    })
    await booking.load('payments')
    return response.json(booking)
  }

  /**
   * Create a new booking
   */
  async store({ request, response }: HttpContext) {
    const data = request.only([
      'mission_id',
      'user_name',
      'user_email',
      'user_phone',
      'billing_address',
      'status',
      'total_amount',
      'special_requests',
      'launch_updates_preference',
    ])

    const booking = await Booking.create({
      id: uuidv4(),
      confirmationCode: generateConfirmationCode(),
      missionId: data.mission_id,
      userName: data.user_name,
      userEmail: data.user_email,
      userPhone: data.user_phone,
      billingAddress: data.billing_address || '',
      status: data.status || BookingStatus.PENDING_PAYMENT,
      totalAmount: data.total_amount || 0,
      subtotal: 0,
      discountAmount: 0,
      taxAmount: 0,
      tipAmount: 0,
      specialRequests: data.special_requests || null,
      launchUpdatesPreference: data.launch_updates_preference || false,
    })

    return response.status(201).json(booking)
  }

  /**
   * Update a booking
   */
  async update({ params, request, response }: HttpContext) {
    const { id } = params
    const booking = await Booking.findOrFail(id)
    
    const data = request.only([
      'mission_id',
      'user_name',
      'user_email',
      'user_phone',
      'billing_address',
      'status',
      'total_amount',
      'special_requests',
      'launch_updates_preference',
    ])

    booking.missionId = data.mission_id || booking.missionId
    booking.userName = data.user_name || booking.userName
    booking.userEmail = data.user_email || booking.userEmail
    booking.userPhone = data.user_phone || booking.userPhone
    booking.billingAddress = data.billing_address || booking.billingAddress
    if (data.status) booking.status = data.status
    if (data.total_amount !== undefined) booking.totalAmount = data.total_amount
    if (data.special_requests !== undefined) booking.specialRequests = data.special_requests
    if (data.launch_updates_preference !== undefined) booking.launchUpdatesPreference = data.launch_updates_preference

    await booking.save()
    await booking.load('mission')
    await booking.load('bookingItems')
    
    return response.json(booking)
  }

  /**
   * Delete a booking
   */
  async destroy({ params, response }: HttpContext) {
    const { id } = params
    const booking = await Booking.findOrFail(id)
    await booking.delete()
    
    return response.status(204).noContent()
  }
}

/**
 * Generate a random confirmation code
 */
function generateConfirmationCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
} 