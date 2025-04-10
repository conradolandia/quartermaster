import { test } from '@japa/runner'
import AdminUser, { AdminRole } from '#models/admin_user'
import Booking, { BookingStatus } from '#models/booking'
import BookingItem, { ItemType, ItemStatus } from '#models/booking_item'
import Mission from '#models/mission'
import Launch from '#models/launch'
import Location from '#models/location'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'

test.group('Admin bookings', (group) => {
  // Test data
  let adminUser: AdminUser
  let mission: Mission
  let bookings: Booking[] = []
  
  // Setup test data before all tests
  group.setup(async () => {
    // Create location and launch for mission
    const location = await Location.create({
      id: uuidv4(),
      name: 'Test Location'
    })
    
    const launch = await Launch.create({
      id: uuidv4(),
      name: 'Test Launch',
      dateTime: DateTime.now().plus({ days: 30 }),
      locationId: location.id,
      summary: 'Test launch summary'
    })
    
    // Create mission for bookings
    mission = await Mission.create({
      id: uuidv4(),
      launchId: launch.id,
      name: 'Test Mission',
      configId: 'test-mission-config',
      active: true,
      public: true,
      salesOpenAt: DateTime.now().minus({ days: 1 }),
      refundCutoffHours: 12
    })
  })
  
  // Before each test: create admin user and authenticate
  group.each.setup(async () => {
    // Clean existing data
    await AdminUser.query().delete()
    await Booking.query().delete()
    bookings = []
  })
  
  // Teardown: clean up database
  group.teardown(async () => {
    await db.rawQuery('TRUNCATE bookings, booking_items, missions, launches, locations, admin_users CASCADE;')
  })
  
  test('unauthenticated access returns 401', async ({ client }) => {
    const response = await client.get('/admin/bookings')
    response.assertStatus(401)
  })
  
  test('admin can access bookings with pagination', async ({ client, assert }) => {
    // Create admin user
    adminUser = await AdminUser.create({
      email: `admin_${Date.now()}@example.com`,
      password: 'admin123',
      name: 'Admin User',
      role: AdminRole.ADMIN
    })
    
    // Create test bookings
    const createBooking = async (name: string, email: string, code: string) => {
      const booking = await Booking.create({
        id: uuidv4(),
        confirmationCode: code,
        missionId: mission.id,
        userName: name,
        userEmail: email,
        userPhone: '123-456-7890',
        billingAddress: '123 Test St, Test City, TS 12345',
        subtotal: 100,
        discountAmount: 0,
        taxAmount: 7,
        tipAmount: 10,
        totalAmount: 117,
        status: BookingStatus.CONFIRMED,
        launchUpdatesPreference: true
      })
      
      await BookingItem.create({
        id: uuidv4(),
        bookingId: booking.id,
        itemType: ItemType.ADULT_TICKET,
        quantity: 2,
        pricePerUnit: 50,
        status: ItemStatus.ACTIVE
      })
      
      bookings.push(booking)
      return booking
    }
    
    // Create different bookings for testing
    await createBooking('John Doe', 'john@example.com', 'ABC123')
    await createBooking('Jane Smith', 'jane@example.com', 'DEF456')
    await createBooking('Bob Johnson', 'bob@example.com', 'GHI789')

    // Use the loginAs method provided by the authApiClient plugin
    const response = await client
      .get('/admin/bookings')
      .loginAs(adminUser)
    
    response.assertStatus(200)
    
    // Debug the response structure
    console.log('Response body:', JSON.stringify(response.body(), null, 2))
    
    response.assertBodyContains({ meta: { total: 3 } })
    
    // Check for required fields in response
    const responseBody = response.body()
    const bookingData = responseBody.data[0]
    
    // Verify booking structure
    assert.exists(bookingData.id)
    assert.exists(bookingData.confirmationCode)
    assert.exists(bookingData.userName)
    assert.exists(bookingData.userEmail)
    assert.exists(bookingData.status)
    
    // Verify mission is preloaded
    assert.exists(bookingData.mission)
    assert.exists(bookingData.mission.name)
  })
  
  test('filter bookings by confirmation code', async ({ client, assert }) => {
    // Create admin user
    adminUser = await AdminUser.create({
      email: `admin_${Date.now()}@example.com`,
      password: 'admin123',
      name: 'Admin User',
      role: AdminRole.ADMIN
    })
    
    // Create test booking with specific confirmation code
    await Booking.create({
      id: uuidv4(),
      confirmationCode: 'ABC123',
      missionId: mission.id,
      userName: 'John Doe',
      userEmail: 'john@example.com',
      userPhone: '123-456-7890',
      billingAddress: '123 Test St, Test City, TS 12345',
      subtotal: 100,
      discountAmount: 0,
      taxAmount: 7,
      tipAmount: 10,
      totalAmount: 117,
      status: BookingStatus.CONFIRMED,
      launchUpdatesPreference: true
    })
    
    // Use the loginAs method
    const response = await client
      .get('/admin/bookings?confirmation_code=ABC123')
      .loginAs(adminUser)
    
    response.assertStatus(200)
    response.assertBodyContains({ meta: { total: 1 } })
    
    const bookingData = response.body().data[0]
    assert.equal(bookingData.confirmationCode, 'ABC123')
  })
  
  test('filter bookings by user name (case insensitive)', async ({ client, assert }) => {
    // Create admin user
    adminUser = await AdminUser.create({
      email: `admin_${Date.now()}@example.com`,
      password: 'admin123',
      name: 'Admin User',
      role: AdminRole.ADMIN
    })
    
    // Create test booking with specific user name
    await Booking.create({
      id: uuidv4(),
      confirmationCode: 'DEF456',
      missionId: mission.id,
      userName: 'John Doe',
      userEmail: 'john@example.com',
      userPhone: '123-456-7890',
      billingAddress: '123 Test St, Test City, TS 12345',
      subtotal: 100,
      discountAmount: 0,
      taxAmount: 7,
      tipAmount: 10,
      totalAmount: 117,
      status: BookingStatus.CONFIRMED,
      launchUpdatesPreference: true
    })
    
    // Use the loginAs method
    const response = await client
      .get('/admin/bookings?user_name=john')
      .loginAs(adminUser)
    
    response.assertStatus(200)
    response.assertBodyContains({ meta: { total: 1 } })
    
    const bookingData = response.body().data[0]
    assert.equal(bookingData.userName, 'John Doe')
  })
  
  test('filter bookings by email (case insensitive)', async ({ client, assert }) => {
    // Create admin user
    adminUser = await AdminUser.create({
      email: `admin_${Date.now()}@example.com`,
      password: 'admin123',
      name: 'Admin User',
      role: AdminRole.ADMIN
    })
    
    // Create test booking with specific email
    await Booking.create({
      id: uuidv4(),
      confirmationCode: 'GHI789',
      missionId: mission.id,
      userName: 'Jane Smith',
      userEmail: 'jane@example.com',
      userPhone: '123-456-7890',
      billingAddress: '123 Test St, Test City, TS 12345',
      subtotal: 100,
      discountAmount: 0,
      taxAmount: 7,
      tipAmount: 10,
      totalAmount: 117,
      status: BookingStatus.CONFIRMED,
      launchUpdatesPreference: true
    })
    
    // Use the loginAs method
    const response = await client
      .get('/admin/bookings?user_email=JANE')
      .loginAs(adminUser)
    
    response.assertStatus(200)
    response.assertBodyContains({ meta: { total: 1 } })
    
    const bookingData = response.body().data[0]
    assert.equal(bookingData.userEmail, 'jane@example.com')
  })
  
  test('pagination parameters work correctly', async ({ client, assert }) => {
    // Create admin user
    adminUser = await AdminUser.create({
      email: `admin_${Date.now()}@example.com`,
      password: 'admin123',
      name: 'Admin User',
      role: AdminRole.ADMIN
    })
    
    // Create 10 bookings for pagination testing
    for (let i = 0; i < 10; i++) {
      await Booking.create({
        id: uuidv4(),
        confirmationCode: `TEST${i}`,
        missionId: mission.id,
        userName: `Test User ${i}`,
        userEmail: `test${i}@example.com`,
        userPhone: '123-456-7890',
        billingAddress: '123 Test St, Test City, TS 12345',
        subtotal: 100,
        discountAmount: 0,
        taxAmount: 7,
        tipAmount: 10,
        totalAmount: 117,
        status: BookingStatus.CONFIRMED,
        launchUpdatesPreference: true
      })
    }
    
    // Test page 1 with limit 5
    const responsePage1 = await client
      .get('/admin/bookings?page=1&limit=5')
      .loginAs(adminUser)
    
    responsePage1.assertStatus(200)
    const page1Data = responsePage1.body()
    assert.equal(page1Data.data.length, 5)
    assert.equal(page1Data.meta.total, 10)
    assert.equal(page1Data.meta.perPage, 5)
    assert.equal(page1Data.meta.currentPage, 1)
    
    // Test page 2 with limit 5
    const responsePage2 = await client
      .get('/admin/bookings?page=2&limit=5')
      .loginAs(adminUser)
    
    responsePage2.assertStatus(200)
    const page2Data = responsePage2.body()
    assert.equal(page2Data.data.length, 5)
    assert.equal(page2Data.meta.currentPage, 2)
  })
})