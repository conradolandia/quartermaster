import type { HttpContext } from '@adonisjs/core/http'
import Booking from '#models/booking'
import { createBookingValidator } from '#validators/create_booking_validator'
import { inject } from '@adonisjs/core'
import BookingService from '#services/BookingService'

@inject()
export default class BookingsController {
  constructor(protected bookingService: BookingService) {}

  /**
   * Display a list of all bookings
   */
  async index({ response }: HttpContext) {
    console.log('[BookingsController.index] Received request');
    try {
      const bookings = await Booking.query()
        .preload('mission')
        .preload('bookingItems', (query) => {
          query.preload('trip')
          query.preload('boat')
        })
      console.log('[BookingsController.index] Query completed, found:', bookings.length);
      return response.json(bookings)
    } catch (error) {
      console.error('[BookingsController.index] Error during query:', error);
      return response.status(500).json({ message: 'Error retrieving bookings' });
    }
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
      query.preload('boat')
    })
    await booking.load('payments')
    return response.json(booking)
  }

  /**
   * Create a new booking using BookingService
   */
  async store({ request, response }: HttpContext) {
    // console.log('CONTROLLER - Incoming raw request body:', request.body()); // Log raw body
    const validatedData = await request.validateUsing(createBookingValidator)
    // console.log('CONTROLLER - Validated data:', validatedData); // Log after validation (if successful)

    try {
      const { booking } = await this.bookingService.createBooking({
        missionId: validatedData.missionId,
        userName: validatedData.userName,
        userEmail: validatedData.userEmail,
        userPhone: validatedData.userPhone,
        billingAddress: validatedData.billingAddress,
        specialRequests: validatedData.specialRequests,
        tipAmount: validatedData.tipAmount,
        items: validatedData.items.map((item) => ({
          tripId: item.tripId,
          boatId: item.boatId,
          itemType: item.itemType,
          quantity: item.quantity,
        })),
      })

      return response.status(201).json(booking)
    } catch (error) {
      if (error.code === 'E_MISSION_INVALID') {
        return response.status(400).json({ message: error.message })
      }
      if (error.code === 'E_INSUFFICIENT_CAPACITY') {
        return response.status(409).json({ message: error.message })
      }
      console.error('Booking creation failed:', error)
      return response.status(error.status || 500).json({
        message: error.message || 'An unexpected error occurred during booking creation.',
      })
    }
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
      'special_requests',
      'launch_updates_preference',
    ])

    booking.merge(data)

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