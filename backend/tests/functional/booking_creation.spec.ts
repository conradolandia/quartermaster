import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'
import sinon from 'sinon' // Import sinon
import EmailService from '#services/EmailService' // Keep alias for consistency
import Booking, { BookingStatus } from '#models/booking'
import BookingItem, { ItemType } from '#models/booking_item'
import Boat from '#models/boat'
import Jurisdiction from '#models/jurisdiction'
import Location from '#models/location'
import BoatProvider from '#models/boat_provider'
import Mission from '#models/mission'
import Trip, { TripType } from '#models/trip'
import TripBoat from '#models/trip_boat'
import Launch from '#models/launch'
import MissionConfigService from '#services/MissionConfigService' // To get valid IDs from YAML
import { v4 as uuidv4 } from 'uuid' // Import uuid generator
import { DateTime } from 'luxon' // Import DateTime

test.group('Booking Creation API', (group) => {
  let missionConfigService: MissionConfigService
  let emailServiceStub: sinon.SinonStub

  // Config IDs from YAML (used for reference/lookup during setup)
  let missionConfigId: string
  let tripConfigId: string
  let boatConfigId1: string
  let boatConfigId2: string
  let launchConfigId: string // Added for launch lookup

  // DB Records - these hold the actual DB model instances
  let testLocation: Location
  let testJurisdiction: Jurisdiction
  let testProvider: BoatProvider
  let testBoat1: Boat
  let testBoat2: Boat
  let testLaunch: Launch
  let testMission: Mission
  let testTrip: Trip

  // DB IDs (UUIDs) - These are the actual IDs used in API payloads
  let testLocationDbId: string
  let testJurisdictionDbId: string
  let testProviderDbId: string
  let testBoat1DbId: string
  let testBoat2DbId: string
  let testLaunchDbId: string
  let testMissionDbId: string
  let testTripDbId: string

  // Other test data
  let adultTicketPrice: number

  // Setup test data based on missions.yml and create corresponding database records
  group.setup(async () => {
    // 1. Read config to get STRING identifiers used in YAML
    missionConfigService = await app.container.make(MissionConfigService)
    const missionConfig = missionConfigService.getAllMissions()[0] // Assuming first mission in YAML
    const tripConfig = missionConfig.trips[0] // Assuming first trip
    const boatConfig1 = tripConfig.boats[0] // Assuming first boat
    const boatConfig2 = tripConfig.boats[1] // Assuming second boat

    missionConfigId = missionConfig.id // e.g., 'starship-flight-9-take-1'
    tripConfigId = tripConfig.id       // e.g., 'sf9t1-viewing'
    boatConfigId1 = boatConfig1.boat_id // e.g., 'endeavour'
    boatConfigId2 = boatConfig2.boat_id // e.g., 'discovery'
    launchConfigId = missionConfig.launch_id // Get launch ID from config
    adultTicketPrice = missionConfigService.getTripPrice(missionConfigId, tripConfigId, ItemType.ADULT_TICKET) || 0

    // 2. Generate UUIDs for DATABASE records
    testLocationDbId = uuidv4()
    testJurisdictionDbId = uuidv4()
    testProviderDbId = uuidv4()
    testBoat1DbId = uuidv4()
    testBoat2DbId = uuidv4()
    testLaunchDbId = uuidv4()
    testMissionDbId = uuidv4()
    testTripDbId = uuidv4()

    // 3. Create DATABASE records using generated UUIDs
    testLocation = await Location.updateOrCreate({ id: testLocationDbId }, { name: 'Cape Canaveral' })
    testJurisdiction = await Jurisdiction.updateOrCreate(
      { id: testJurisdictionDbId },
      {
        name: 'Port Canaveral',
        state: 'Florida',
        salesTaxRate: 7.0,
        locationId: testLocation.id,
      }
    )
    testProvider = await BoatProvider.updateOrCreate(
      { id: testProviderDbId },
      {
        name: 'Test Boat Provider',
        jurisdictionId: testJurisdiction.id,
        address: '123 Dock St',
        locationDescription: 'Near the port',
        mapLink: 'http://maps.example.com',
      }
    )
    testBoat1 = await Boat.updateOrCreate(
      { id: testBoat1DbId },
      // Use config ID as name for easier reference if needed, but use UUID as primary key
      { name: boatConfigId1, capacity: 150, providerId: testProvider.id }
    )
    testBoat2 = await Boat.updateOrCreate(
      { id: testBoat2DbId },
      { name: boatConfigId2, capacity: 125, providerId: testProvider.id }
    )

    // --- Create Launch, Mission, Trip, TripBoat records ---
    testLaunch = await Launch.updateOrCreate(
        { id: testLaunchDbId },
        {
            name: launchConfigId, // Use config launch ID as name
            dateTime: DateTime.fromJSDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // Future date
            locationId: testLocation.id,
            summary: 'Test Launch Summary'
        }
    )

    // --- Debug: Log the value --- 
    // console.log('DEBUG sales_open_at from config:', missionConfig.sales_open_at, typeof missionConfig.sales_open_at)
    // --- End Debug ---
    testMission = await Mission.updateOrCreate(
        { id: testMissionDbId },
        {
            launchId: testLaunch.id,
            name: missionConfig.name, // Name from config
            configId: missionConfigId, // STORE the YAML ID here
            active: missionConfig.active,
            public: missionConfig.public,
            // --- Use correct DateTime conversion based on type ---
            salesOpenAt: missionConfig.sales_open_at
                         ? (typeof missionConfig.sales_open_at === 'object' && missionConfig.sales_open_at !== null && typeof (missionConfig.sales_open_at as any).toISOString === 'function'
                             ? DateTime.fromJSDate(missionConfig.sales_open_at as Date)
                             : DateTime.fromISO(missionConfig.sales_open_at as string))
                         : DateTime.now(),
            // --- End DateTime conversion ---
            refundCutoffHours: missionConfig.refund_cutoff_hours ?? 12
        }
    )

    testTrip = await Trip.updateOrCreate(
        { id: testTripDbId },
        {
            missionId: testMission.id,
            type: tripConfig.type as TripType,
            configId: tripConfigId,
            active: true, // Assuming active for testing
            // --- Use correct DateTime conversion based on type ---
            checkInTime: tripConfig.check_in_time
                         ? (typeof tripConfig.check_in_time === 'object' && tripConfig.check_in_time !== null && typeof (tripConfig.check_in_time as any).toISOString === 'function'
                             ? DateTime.fromJSDate(tripConfig.check_in_time as Date)
                             : DateTime.fromISO(tripConfig.check_in_time as string))
                         : undefined,
            boardingTime: tripConfig.boarding_time
                          ? (typeof tripConfig.boarding_time === 'object' && tripConfig.boarding_time !== null && typeof (tripConfig.boarding_time as any).toISOString === 'function'
                              ? DateTime.fromJSDate(tripConfig.boarding_time as Date)
                              : DateTime.fromISO(tripConfig.boarding_time as string))
                          : undefined,
            departureTime: tripConfig.departure_time
                           ? (typeof tripConfig.departure_time === 'object' && tripConfig.departure_time !== null && typeof (tripConfig.departure_time as any).toISOString === 'function'
                               ? DateTime.fromJSDate(tripConfig.departure_time as Date)
                               : DateTime.fromISO(tripConfig.departure_time as string))
                           : DateTime.now().plus({ days: 6 }),
            // --- End DateTime conversion ---
        }
    )

    // Create TripBoat associations
    await TripBoat.updateOrCreate(
        { tripId: testTrip.id, boatId: testBoat1.id },
        { id: uuidv4(), maxCapacity: boatConfig1.max_capacity }
    )
    await TripBoat.updateOrCreate(
        { tripId: testTrip.id, boatId: testBoat2.id },
        { id: uuidv4(), maxCapacity: boatConfig2.max_capacity }
    )
    // --- End Create Launch, Mission, Trip, TripBoat records ---

    // Stub EmailService before tests run
    const emailServiceInstance = await app.container.make(EmailService)
    emailServiceStub = sinon.stub(emailServiceInstance, 'sendBookingConfirmation').resolves() // Stub to resolve successfully
    // Re-bind the stubbed instance to the container
    app.container.singleton(EmailService, () => emailServiceInstance)
  })

  // Clean up database tables after each test
  group.each.setup(async () => {
    // Clear bookings first due to foreign key constraints
    await db.rawQuery('TRUNCATE bookings, booking_items CASCADE;')
    // Reset stub history before each test
    emailServiceStub.resetHistory()
  })

  // Restore stubs after the group finishes
  group.teardown(async () => {
    await db.rawQuery('TRUNCATE trip_boats, trips, missions, launches, boats, boat_providers, jurisdictions, locations, admin_users CASCADE;')
    emailServiceStub.restore()
  })

  test('should create a booking successfully with valid data', async ({ client, assert }) => {
    const payload = {
      missionId: testMissionDbId,
      userName: 'Test User',
      userEmail: 'test@example.com',
      userPhone: '1234567890',
      billingAddress: '123 Test St, Testville, TS 12345',
      tipAmount: 10.0,
      items: [
        {
          tripId: testTripDbId,
          boatId: testBoat1DbId,
          itemType: ItemType.ADULT_TICKET,
          quantity: 2,
        },
      ],
    }

    // console.log('TEST (create booking) - Payload being sent:', payload); // Log payload
    const response = await client.post('/api/v1/bookings').json(payload)

    response.assertStatus(201)
    response.assertBodyContains({ missionId: testMissionDbId, userName: 'Test User' })
    assert.exists(response.body().id)
    assert.exists(response.body().confirmationCode)

    // Add assertion for qrCodeDataUrl
    assert.exists(response.body().qrCodeDataUrl, 'qrCodeDataUrl should exist in the response')
    assert.isString(response.body().qrCodeDataUrl, 'qrCodeDataUrl should be a string')
    assert.match(
      response.body().qrCodeDataUrl,
      /^data:image\/png;base64,/,
      'qrCodeDataUrl should be a data URL'
    )
    // You could add a more specific check if you mock the QR code generation
    // For now, just checking the format is sufficient

    assert.equal(response.body().tipAmount, 10.0)
    assert.equal(response.body().subtotal, adultTicketPrice * 2)
    const expectedTax = (adultTicketPrice * 2) * (testJurisdiction.salesTaxRate / 100)
    assert.closeTo(response.body().taxAmount, expectedTax, 0.01)
    const expectedTotal = (adultTicketPrice * 2) * (1 + testJurisdiction.salesTaxRate / 100) + 10.0
    assert.closeTo(response.body().totalAmount, expectedTotal, 0.01)
    assert.equal(response.body().status, BookingStatus.CONFIRMED)

    const bookingItems = await BookingItem.query().where('booking_id', response.body().id)
    assert.lengthOf(bookingItems, 1)
    assert.equal(bookingItems[0].quantity, 2)
    assert.equal(bookingItems[0].itemType, ItemType.ADULT_TICKET)
    assert.equal(bookingItems[0].tripId, testTripDbId)
    assert.equal(bookingItems[0].boatId, testBoat1DbId)

    // Assert that EmailService was called
    assert.isTrue(emailServiceStub.calledOnce, 'EmailService.sendBookingConfirmation should have been called')
    // Assert arguments passed to EmailService
    const bookingArg = emailServiceStub.firstCall.args[0] as Booking
    const qrCodeArg = emailServiceStub.firstCall.args[1] as string
    assert.equal(bookingArg.id, response.body().id, 'Correct booking object passed to email service')
    assert.match(qrCodeArg, /^data:image\/png;base64,/, 'QR code data URL passed to email service')
  })

  test('should fail with validation error if missionId is not a UUID', async ({ client }) => {
      const payload = {
          missionId: 'invalid-mission-uuid-format',
          userName: 'Test User',
          userEmail: 'test@example.com',
          userPhone: '1234567890',
          billingAddress: '123 Test St',
          items: [ { tripId: testTripDbId, boatId: testBoat1DbId, itemType: ItemType.ADULT_TICKET, quantity: 1 } ],
      }

      // console.log('TEST - Payload being sent:', payload);
      const response = await client.post('/api/v1/bookings').json(payload)
      response.assertStatus(422)
      response.assertBodyContains({ messages: [{ rule: 'uuid', field: 'missionId' }] })
  })

  test('should fail with 404 if mission UUID does not exist', async ({ client }) => {
    const nonExistentUuid = uuidv4()
    const payload = {
        missionId: nonExistentUuid,
        userName: 'Test User',
        userEmail: 'test@example.com',
        userPhone: '1234567890',
        billingAddress: '123 Test St',
        items: [ { tripId: testTripDbId, boatId: testBoat1DbId, itemType: ItemType.ADULT_TICKET, quantity: 1 } ],
    }
    const response = await client.post('/api/v1/bookings').json(payload)
    response.assertStatus(404)
    response.assertBodyContains({ message: 'Mission not found' })
  })

  test('should fail with 409 if capacity is exceeded', async ({ client, assert }) => {
      const capacity = testBoat2.capacity
      const boatUuidToTest = testBoat2DbId

      const initialPayload = {
        missionId: testMissionDbId,
        userName: 'Initial Booker',
        userEmail: 'initial@example.com',
        userPhone: '111222333',
        billingAddress: '1 Initial Address Lane',
        items: [
            {
                tripId: testTripDbId,
                boatId: boatUuidToTest,
                itemType: ItemType.ADULT_TICKET,
                quantity: capacity - 1,
            },
        ],
      }
      const initialResponse = await client.post('/api/v1/bookings').json(initialPayload)
      initialResponse.assertStatus(201)
      const initialBooking = await Booking.find(initialResponse.body().id)
      assert.isNotNull(initialBooking)
      initialBooking!.status = BookingStatus.CONFIRMED
      await initialBooking!.save()

      const secondPayload = {
        missionId: testMissionDbId,
        userName: 'Second Booker',
        userEmail: 'second@example.com',
        userPhone: '444555666',
        billingAddress: '2 Second Address Road',
        items: [
            {
                tripId: testTripDbId,
                boatId: boatUuidToTest,
                itemType: ItemType.ADULT_TICKET,
                quantity: 2,
            },
        ],
      }

      const secondResponse = await client.post('/api/v1/bookings').json(secondPayload)

      secondResponse.assertStatus(409)
      assert.include(secondResponse.body().message, 'Not enough capacity')

      const bookings = await Booking.query().where('mission_id', testMissionDbId)
      assert.lengthOf(bookings, 1)
      assert.equal(bookings[0].userName, 'Initial Booker')
      assert.equal(bookings[0].status, BookingStatus.CONFIRMED)
  })

  test('should fail with validation error for invalid item quantity', async ({ client }) => {
    const payload = {
        missionId: testMissionDbId,
        userName: 'Test User',
        userEmail: 'test@example.com',
        userPhone: '1234567890',
        billingAddress: '123 Test St',
        items: [
            {
                tripId: testTripDbId,
                boatId: testBoat1DbId,
                itemType: ItemType.ADULT_TICKET,
                quantity: 0,
            },
        ],
    }

    const response = await client.post('/api/v1/bookings').json(payload)

    response.assertStatus(422)
    response.assertBodyContains({ messages: [{ rule: 'min', field: 'items.0.quantity' }] })
  })

  test('should fail with validation error if items array is empty', async ({ client }) => {
    const payload = {
        missionId: testMissionDbId,
        userName: 'Test User',
        userEmail: 'test@example.com',
        userPhone: '1234567890',
        billingAddress: '123 Test St',
        items: [],
    }

    const response = await client.post('/api/v1/bookings').json(payload)

    response.assertStatus(422)
    response.assertBodyContains({ messages: [{ rule: 'array.minLength', field: 'items' }] })
  })

  test('should calculate zero tax if jurisdiction tax rate is zero', async ({ client, assert }) => {
    const originalTaxRate = testJurisdiction.salesTaxRate
    testJurisdiction.salesTaxRate = 0.0
    await testJurisdiction.save()

    const payload = {
      missionId: testMissionDbId,
      userName: 'Tax Test User',
      userEmail: 'tax@example.com',
      userPhone: '9876543210',
      billingAddress: '456 Tax Free Ave',
      tipAmount: 0.0,
      items: [
        {
          tripId: testTripDbId,
          boatId: testBoat1DbId,
          itemType: ItemType.ADULT_TICKET,
          quantity: 1,
        },
      ],
    }

    const response = await client.post('/api/v1/bookings').json(payload)

    response.assertStatus(201)
    assert.equal(response.body().taxAmount, 0)
    assert.equal(response.body().totalAmount, adultTicketPrice)

    testJurisdiction.salesTaxRate = originalTaxRate
    await testJurisdiction.save()
  })
}) 