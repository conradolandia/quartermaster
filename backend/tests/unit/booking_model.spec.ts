import { test } from '@japa/runner'
import { v4 as uuidv4 } from 'uuid'
import Booking, { BookingStatus } from '#models/booking'
import Mission from '#models/mission'
import Launch from '#models/launch'
import { DateTime } from 'luxon'

test.group('Booking Model', (group) => {
  let testMissionId: string
  let testLaunchId: string

  // Setup: Create test data
  group.setup(async () => {
    // Create test launch first
    const launch = new Launch()
    launch.id = uuidv4()
    launch.name = 'Test Launch'
    launch.dateTime = DateTime.local().plus({ days: 10 })
    await launch.save()
    testLaunchId = launch.id

    // Create test mission with the launch ID
    const mission = new Mission()
    mission.id = uuidv4()
    mission.launchId = testLaunchId
    mission.name = 'Test Mission'
    mission.salesOpenAt = DateTime.local()
    mission.active = true
    mission.public = true
    await mission.save()
    testMissionId = mission.id
  })

  // Teardown: Clean up test data
  group.teardown(async () => {
    // Delete mission first due to foreign key constraints
    await Mission.findOrFail(testMissionId).then((mission) => mission.delete())
    // Then delete launch
    await Launch.findOrFail(testLaunchId).then((launch) => launch.delete())
  })

  test('can create a booking', async ({ assert }) => {
    const booking = new Booking()
    booking.id = uuidv4()
    booking.missionId = testMissionId
    booking.confirmationCode = '123456'
    booking.userName = 'Test User'
    booking.userEmail = 'test@example.com'
    booking.userPhone = '555-1234'
    booking.billingAddress = '123 Test St'
    booking.subtotal = 150
    booking.discountAmount = 0
    booking.taxAmount = 10
    booking.tipAmount = 20
    booking.totalAmount = 180
    booking.status = BookingStatus.CONFIRMED
    booking.launchUpdatesPreference = true
    
    await booking.save()
    
    const savedBooking = await Booking.find(booking.id)
    assert.exists(savedBooking)
    assert.equal(savedBooking?.missionId, testMissionId)
    assert.equal(savedBooking?.userName, 'Test User')
    assert.equal(savedBooking?.userEmail, 'test@example.com')
    assert.equal(savedBooking?.status, BookingStatus.CONFIRMED)
    assert.equal(savedBooking?.totalAmount, 180)
    
    // Clean up
    if (savedBooking) await savedBooking.delete()
  })
  
  test('can load booking relationships', async ({ assert }) => {
    const booking = new Booking()
    booking.id = uuidv4()
    booking.missionId = testMissionId
    booking.confirmationCode = '654321'
    booking.userName = 'Jane Doe'
    booking.userEmail = 'jane@example.com'
    booking.userPhone = '555-5678'
    booking.billingAddress = '456 Test St'
    booking.subtotal = 200
    booking.discountAmount = 20
    booking.taxAmount = 15
    booking.tipAmount = 0
    booking.totalAmount = 195
    booking.status = BookingStatus.PENDING_PAYMENT
    booking.launchUpdatesPreference = false
    
    await booking.save()
    
    // Load relationships
    await booking.load('mission')
    
    assert.equal(booking.mission.id, testMissionId)
    assert.equal(booking.mission.name, 'Test Mission')
    
    // Clean up
    await booking.delete()
  })
})