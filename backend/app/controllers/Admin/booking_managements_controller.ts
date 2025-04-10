import type { HttpContext } from '@adonisjs/core/http'
import Booking from '#models/booking' // Import the Booking model

export default class BookingManagementsController {
  /**
   * Display a list of resource
   */
  async index({ request, response }: HttpContext) {
    // Get query parameters for filtering and pagination
    const { page, limit, confirmation_code, user_name, user_email } = request.qs()

    const pageNumber = page ? parseInt(page, 10) : 1
    const limitNumber = limit ? parseInt(limit, 10) : 15

    // Start building the query
    const query = Booking.query()

    // Apply filters
    if (confirmation_code) {
      query.where('confirmation_code', confirmation_code)
    }
    if (user_name) {
      // Case-insensitive search for name
      query.whereILike('user_name', `%${user_name}%`)
    }
    if (user_email) {
      // Case-insensitive search for email
      query.whereILike('user_email', `%${user_email}%`)
    }

    // Preload relationships (adjust as needed)
    query.preload('mission')
    // Optionally preload items if needed frequently in the admin list
    // query.preload('bookingItems') 

    // Order results
    query.orderBy('created_at', 'desc')

    // Execute query with pagination
    try {
      const bookings = await query.paginate(pageNumber, limitNumber)
      return response.ok(bookings)
    } catch (error) {
      // Log the error (implement proper logging later)
      console.error('Error fetching admin bookings:', error)
      return response.internalServerError({ message: 'Failed to fetch bookings' })
    }
  }

  /**
   * Display form to create a new record
   */
  async create({}: HttpContext) {}

  /**
   * Handle form submission for the create action
   */
  // store({ request }: HttpContext) {
    // Admin cannot create bookings via API for MVP
  // }

  /**
   * Show individual record
   */
  // async show({ params }: HttpContext) {
    // Potential future implementation
    // const booking = await Booking.findOrFail(params.id)
    // await booking.load('mission')
    // await booking.load('bookingItems') // Load items for detail view
    // return booking
  // }

  /**
   * Edit individual record
   */
  async edit({ params }: HttpContext) {}

  /**
   * Handle form submission for the edit action
   */
  // update({ params, request }: HttpContext) {
    // Potential future implementation
  // }

  /**
   * Delete record
   */
  // destroy({ params }: HttpContext) {
    // Potential future implementation
  // }
}