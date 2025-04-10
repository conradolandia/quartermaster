import { test } from '@japa/runner'
import PaymentService, { MockPaymentResult } from '#services/PaymentService'
import Booking, { BookingStatus } from '#models/booking'
import { v4 as uuidv4 } from 'uuid'


test.group('PaymentService Unit Tests', (group) => {
  let paymentService: PaymentService

  group.each.setup(() => {
    paymentService = new PaymentService()
  })

  test('processPayment should return success and a mock paymentIntentId', async ({ assert }) => {
    // Arrange: Create a mock Booking object
    const mockBooking = new Booking()
    mockBooking.id = uuidv4()
    mockBooking.totalAmount = 123.45
    mockBooking.status = BookingStatus.PENDING_PAYMENT // Initial status

    // Act: Call the processPayment method
    const result: MockPaymentResult = await paymentService.processPayment(mockBooking)

    // Assert: Check the result
    assert.isTrue(result.success, 'Payment should be successful')
    assert.isString(result.paymentIntentId, 'PaymentIntentId should be a string')
    assert.isTrue(result.paymentIntentId!.startsWith('mock_pi_'), 'PaymentIntentId should start with mock_pi_')
    assert.isUndefined(result.errorMessage, 'Error message should be undefined for success')

    // Optional: Assert that the original booking status hasn't been changed by the *service* itself
    // The BookingService *caller* is responsible for updating the status based on the result.
    assert.equal(mockBooking.status, BookingStatus.PENDING_PAYMENT, 'PaymentService should not modify booking status directly')
  })

  // Add more tests here if the service becomes more complex (e.g., handling different scenarios)
})
