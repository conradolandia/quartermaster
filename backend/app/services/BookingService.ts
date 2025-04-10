import { inject } from '@adonisjs/core'
import db from '@adonisjs/lucid/services/db'
import { v4 as uuidv4 } from 'uuid'
import { Exception } from '@adonisjs/core/exceptions'
import MissionConfigService from './MissionConfigService.js'
import PaymentService from './PaymentService.js'
import Booking, { BookingStatus } from '#models/booking'
import BookingItem, { ItemStatus, ItemType } from '#models/booking_item'
import Boat from '#models/boat'
import Jurisdiction from '#models/jurisdiction'
import Mission from '#models/mission'
import Trip from '#models/trip'

// Input structure for creating a booking
export interface CreateBookingData {
  missionId: string
  userName: string
  userEmail: string
  userPhone: string
  billingAddress: string
  specialRequests?: string | null
  launchUpdatesPreference?: boolean
  tipAmount?: number
  items: {
    tripId: string
    boatId: string
    itemType: ItemType // e.g., ItemType.ADULT_TICKET
    quantity: number
  }[]
  // PaymentIntentId will be added later after successful Stripe payment
}

// Output structure after successful booking creation
export interface BookingCreationResult {
  booking: Booking
}

@inject()
export default class BookingService {
  constructor(
    protected missionConfigService: MissionConfigService,
    protected paymentService: PaymentService
  ) {}

  /**
   * Generates a random, unique confirmation code.
   */
  private generateConfirmationCode(): string {
    // Simple random alphanumeric code, adjust length/complexity as needed
    return Math.random().toString(36).substring(2, 10).toUpperCase()
  }

  /**
   * Calculates the total number of passengers booked for a specific boat on a specific trip.
   */
  private async getBookedCapacity(tripId: string, boatId: string): Promise<number> {
    const result = await BookingItem.query()
      .where('tripId', tripId)
      .where('boatId', boatId)
      .where('status', ItemStatus.ACTIVE) // Only count active items
      .whereIn('itemType', [ItemType.ADULT_TICKET, ItemType.CHILD_TICKET]) // Only count passenger tickets
      .sum('quantity as total')

    return Number(result[0]?.$extras?.total || 0)
  }

  /**
   * Fetches the effective capacity for a boat on a trip.
   * Uses YAML override if present, otherwise fetches from Boat model.
   * ACCEPTS BOAT DB UUID.
   */
  private async getEffectiveBoatCapacity(
    missionId: string,
    tripId: string,
    boatDbId: string, // Expect DB UUID here
    boatConfigId: string // Config ID (e.g., 'endeavour') for YAML lookup
  ): Promise<number> {
    // Lookup override using the config ID
    const boatConfig = this.missionConfigService.getBoatConfig(missionId, tripId, boatConfigId)

    if (boatConfig?.max_capacity !== undefined && boatConfig.max_capacity !== null) {
      return boatConfig.max_capacity
    }

    // If no override, fetch default capacity from the Boat model using DB UUID
    // Optimization: Assume boat record is already fetched by the caller
    const boat = await Boat.find(boatDbId) // Fetch if not passed in
    if (!boat) {
      throw new Exception(`Boat DB ID ${boatDbId} not found`, { code: 'E_BOAT_NOT_FOUND', status: 404 })
    }
    return boat.capacity
  }

  /**
   * Creates a new booking.
   * Handles validation, capacity checks, cost calculation, DB insertion,
   * and mock payment processing.
   */
  async createBooking(data: CreateBookingData): Promise<BookingCreationResult> {
    // --- Use Database Transaction ---
    const trx = await db.transaction()

    let newBooking: Booking | null = null // Define booking variable outside try block

    try {
      // --- 1. Fetch Core DB Records by UUID & Validate Existence ---
      const missionRecord = await Mission.query({ client: trx }).where('id', data.missionId).first()
      if (!missionRecord) {
        throw new Exception('Mission not found', { code: 'E_MISSION_NOT_FOUND', status: 404 })
      }
      // Use the dedicated configId field for lookup
      const missionConfigStringId = missionRecord.configId
      if (!missionConfigStringId) {
        // Defensive check if configId is missing
        throw new Exception(`Configuration ID (configId) missing for mission ${missionRecord.id}`, { status: 500 });
      }

      // --- Check Mission Status using Config Service (using STRING ID) ---
      const missionConfig = this.missionConfigService.getMissionConfig(missionConfigStringId)
      if (!missionConfig || !missionConfig.active) {
        throw new Exception('Mission not found or not active for booking', {
          code: 'E_MISSION_INVALID',
          status: 400,
        })
      }
      // --- End Fetch & Validate Mission ---

      let subtotal = 0
      let totalQuantity = 0
      let firstJurisdictionId: string | null = null // Store first found jurisdiction for tax

      // --- 2. Validate Items, Calculate Subtotal & Check Capacity ---
      const bookingItemsData: Partial<BookingItem>[] = []

      for (const item of data.items) {
        // --- Fetch Trip and Boat records by UUID ---
        const tripRecord = await Trip.query({ client: trx }).where('id', item.tripId).first()
        if (!tripRecord) {
           throw new Exception(`Trip with ID '${item.tripId}' not found`, { code: 'E_TRIP_NOT_FOUND', status: 400 })
        }
        
        // --- Fetch Boat record by UUID ---
        const boatRecord = await Boat.query({ client: trx })
                                   .preload('provider') 
                                   .where('id', item.boatId) // Look up by UUID
                                   .first()
        if (!boatRecord) {
          throw new Exception(`Boat with ID '${item.boatId}' not found`, { code: 'E_BOAT_NOT_FOUND_BY_ID', status: 400 })
        }

        // Assume boat name holds the string config ID
        const boatConfigStringId = boatRecord.name 
        if (!boatConfigStringId) {
           throw new Exception(`Configuration ID (name) missing for boat ${boatRecord.id}`, { status: 500 });
        }
        
        // --- End Fetch Trip/Boat ---

        // Store the first boat's jurisdiction ID for tax calculation
        if (!firstJurisdictionId && boatRecord.provider?.jurisdictionId) {
            firstJurisdictionId = boatRecord.provider.jurisdictionId
        }

        // --- Use String IDs for Config Service Lookups ---
        // Fetch the string ID stored in the Trip record
        const tripConfigStringId = tripRecord.configId
        if (!tripConfigStringId) {
          // Defensive check
          throw new Exception(`Configuration ID (configId) missing for trip ${tripRecord.id}`, { status: 500 });
        }

        // --- Get Trip Config ---
        const tripConfig = this.missionConfigService.getTripConfig(missionConfigStringId, tripConfigStringId)
        if (!tripConfig) {
          // This check might be redundant if we trust the DB records, but good for safety
          throw new Exception(`Trip config '${tripConfigStringId}' not found for mission '${missionConfigStringId}'`, { status: 500 })
        }

        // --- Get Price Per Unit ---
        const pricePerUnit = this.missionConfigService.getTripPrice(
          missionConfigStringId,
          tripConfigStringId, // Use Trip String ID
          item.itemType
        )
        // --- End Config Service Lookups ---

        // --- Validate Price Per Unit ---
        if (pricePerUnit === undefined) {
          throw new Exception(`Price for ${item.itemType} on trip ${tripRecord.id} not configured`, {
            status: 400,
          })
        }

        // --- Validate Item Quantity ---
        if (item.quantity <= 0) {
          throw new Exception(`Item quantity for ${item.itemType} must be positive`, { status: 400 })
        }

        // --- Capacity Check ---
        if (item.itemType === ItemType.ADULT_TICKET || item.itemType === ItemType.CHILD_TICKET) {
          const boatDbId = boatRecord.id // Use UUID for DB checks
          
          const effectiveCapacity = await this.getEffectiveBoatCapacity(
            missionConfigStringId, // Use String ID for config lookup
            tripConfigStringId,    // Use Trip String ID
            boatDbId,              // Use DB UUID
            boatConfigStringId     // Use String ID for config lookup
          )

          // --- Get Booked Capacity ---
          // Use UUIDs for DB capacity check
          const bookedCapacity = await this.getBookedCapacity(tripRecord.id, boatDbId)

          if (bookedCapacity + item.quantity > effectiveCapacity) {
            throw new Exception(
              // Use names/string IDs in user-facing error
              `Not enough capacity on boat ${boatConfigStringId} for trip ${tripConfigStringId}`,
              {
                code: 'E_INSUFFICIENT_CAPACITY',
                status: 409, // Conflict
              }
            )
          }
        }
        // --- End Capacity Check ---

        // --- Calculate Subtotal ---
        subtotal += pricePerUnit * item.quantity
        totalQuantity += item.quantity

        // --- Create BookingItem Record Data (without bookingId yet) ---
        bookingItemsData.push({
          id: uuidv4(),
          tripId: tripRecord.id,
          boatId: boatRecord.id,
          itemType: item.itemType,
          quantity: item.quantity,
          pricePerUnit: pricePerUnit,
          status: ItemStatus.ACTIVE,
        })
      }

      // --- Validate Booking Contains Items ---
      if (totalQuantity === 0) {
        throw new Exception('Booking must contain at least one item', { status: 400 })
      }

      // --- 3. Calculate Tax ---
      let taxRate = 0.0
      if (firstJurisdictionId) {
        const jurisdiction = await Jurisdiction.query({ client: trx })
                                           .where('id', firstJurisdictionId)
                                           .first()
        if (jurisdiction) {
          taxRate = jurisdiction.salesTaxRate / 100
        }
      }
      const taxAmount = subtotal * taxRate

      // --- 4. Calculate Total Amount ---
      const tip = data.tipAmount && data.tipAmount > 0 ? data.tipAmount : 0
      const discount = 0 // Placeholder for future discount logic
      const totalAmount = subtotal - discount + taxAmount + tip

      // --- 5. Create Booking Record (Initial Status: PENDING_PAYMENT) ---
      const confirmationCode = this.generateConfirmationCode()
      newBooking = await Booking.create(
        {
          id: uuidv4(),
          missionId: missionRecord.id,
          confirmationCode: confirmationCode,
          userName: data.userName,
          userEmail: data.userEmail,
          userPhone: data.userPhone,
          billingAddress: data.billingAddress,
          subtotal: subtotal,
          discountAmount: discount,
          taxAmount: taxAmount,
          tipAmount: tip,
          totalAmount: totalAmount,
          specialRequests: data.specialRequests,
          launchUpdatesPreference: data.launchUpdatesPreference ?? false,
          status: BookingStatus.PENDING_PAYMENT, // Start as pending
          paymentIntentId: null, // Set later
        },
        { client: trx }
      )

      // --- 6. Create Booking Items (associate with the new booking) ---
      const itemsToCreate = bookingItemsData.map((itemData) => ({
        ...itemData,
        bookingId: newBooking!.id, // Assign the booking ID
      }))
      await BookingItem.createMany(itemsToCreate, { client: trx })

      // --- 7. Process Mock Payment ---
      const paymentResult = await this.paymentService.processPayment(newBooking)

      // --- 8. Update Booking Status based on Payment ---
      if (paymentResult.success) {
        newBooking.status = BookingStatus.CONFIRMED
        newBooking.paymentIntentId = paymentResult.paymentIntentId
        await newBooking.save() // Save changes within the transaction
      } else {
        // Handle payment failure - potentially mark booking as failed or keep pending
        // For MVP mock, we assume success, but this is where failure logic would go.
        console.error(`Mock payment failed for booking ${newBooking.id}: ${paymentResult.errorMessage}`)
        // Optional: Throw an exception to rollback the transaction on mock failure
        // throw new Exception('Mock Payment Failed', { code: 'E_PAYMENT_FAILED', status: 500 });
      }

      // --- Commit Transaction ---
      await trx.commit()

      // --- 9. Return successful result (outside transaction) ---
      // Reload relations if needed after commit
      await newBooking.load('bookingItems')
      await newBooking.load('mission')

      return { booking: newBooking }
    } catch (error) {
      // --- Rollback Transaction on Error ---
      await trx.rollback()
      console.error('[BookingService.createBooking] Error:', error)
      // Re-throw the original error or a generic one
      throw error // Re-throw to be handled by the controller
    }
  }
}
