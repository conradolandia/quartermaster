import { inject } from '@adonisjs/core'
import mail from '@adonisjs/mail/services/main'
import env from '#start/env'
import Booking from '#models/booking'
// import { inject } from '@adonisjs/core'
// import mail from '@adonisjs/mail/services/main' // Correct import/injection will be handled later

@inject()
export default class EmailService {
  constructor() {}

  /**
   * Sends a booking confirmation email.
   *
   * @param booking The confirmed booking object.
   * @param qrCodeDataUrl The data URL of the QR code image.
   */
  async sendBookingConfirmation(booking: Booking, qrCodeDataUrl: string): Promise<void> {
    // Ensure necessary relationships are loaded if needed by the template
    // Example: await booking.load('mission')

    try {
      await mail.send((message) => {
        message
          .to(booking.userEmail)
          .from(env.get('MAIL_FROM_ADDRESS', 'noreply@star-fleet.tours'))
          .replyTo(env.get('MAIL_REPLY_TO_ADDRESS', 'support@star-fleet.tours'))
          .subject(`Star✦Fleet Tours Booking Confirmation: ${booking.confirmationCode}`)
          .htmlView('emails/booking_confirmation', { booking, qrCodeDataUrl })
          // Optionally add a text version
          // .textView('emails/booking_confirmation_text', { booking })
      })
      console.log(`[EmailService] Booking confirmation email sent to ${booking.userEmail} for booking ${booking.confirmationCode}`)
    } catch (error) {
      console.error(
        `[EmailService] Failed to send confirmation email to ${booking.userEmail} for booking ${booking.confirmationCode}:`,
        error
      )
      // Re-throw the error so the caller (BookingService) knows about the failure
      // Depending on requirements, you might want to handle this differently
      // (e.g., retry logic, marking booking as confirmation_pending)
      throw new Error(`Failed to send booking confirmation email: ${error.message}`)
    }
  }

  // Email sending logic (e.g., booking confirmation) will go here
} 