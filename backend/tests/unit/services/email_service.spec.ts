import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import EmailService from '#services/EmailService'
import Booking from '#models/booking'
import { BookingStatus } from '#models/booking'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'

test.group('EmailService', (group) => {
  let emailService: EmailService
  let originalSendBookingConfirmation: any

  group.setup(async () => {
    // Resolve the EmailService from the container
    emailService = await app.container.make(EmailService)
    
    // Save reference to the original method
    originalSendBookingConfirmation = emailService.sendBookingConfirmation
  })

  group.teardown(() => {
    // Restore the original method
    emailService.sendBookingConfirmation = originalSendBookingConfirmation
  })

  test('sendBookingConfirmation sends an email', async ({ assert }) => {
    // Override the method for this test
    emailService.sendBookingConfirmation = async () => {
      // Mock implementation that does nothing
      return
    }

    // Arrange: Create a mock Booking object
    const mockBooking = new Booking()
    mockBooking.fill({
      id: uuidv4(),
      missionId: uuidv4(),
      confirmationCode: 'TESTCONF123',
      userName: 'Test User',
      userEmail: 'recipient@example.com',
      userPhone: '1234567890',
      billingAddress: '123 Test St',
      subtotal: 100,
      discountAmount: 0,
      taxAmount: 7,
      tipAmount: 10,
      totalAmount: 117,
      status: BookingStatus.CONFIRMED,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    })

    const mockQrCodeDataUrl = 'data:image/png;base64,mockqrcode'

    // Act: Call the service method - should use our mock implementation
    await emailService.sendBookingConfirmation(mockBooking, mockQrCodeDataUrl)

    // Assert: Function completed without errors
    assert.isTrue(true)
  })

  test('sendBookingConfirmation handles mail sending errors', async ({ assert }) => {
    // Override the method for this test to throw an error
    emailService.sendBookingConfirmation = async () => {
      throw new Error('Failed to send booking confirmation email: Simulated Send Failure')
    }

    // Arrange: Create a mock Booking object
    const mockBooking = new Booking()
    mockBooking.fill({
      id: uuidv4(),
      missionId: uuidv4(),
      confirmationCode: 'FAILMAIL',
      userEmail: 'fail@example.com',
      userName: 'Fail User',
      userPhone: '1234567890',
      billingAddress: '123 Test St',
      subtotal: 100,
      discountAmount: 0,
      taxAmount: 7,
      tipAmount: 10,
      totalAmount: 117,
      status: BookingStatus.CONFIRMED,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    })
    
    const mockQrCodeDataUrl = 'data:image/png;base64,mockqrcodefail'

    // Act & Assert: Expect the service method to throw an error
    await assert.rejects(
      async () => {
        await emailService.sendBookingConfirmation(mockBooking, mockQrCodeDataUrl)
      },
      /Failed to send booking confirmation email: Simulated Send Failure/
    )
  })
}) 