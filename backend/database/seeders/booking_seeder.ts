import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Booking from '#models/booking'
import Mission from '#models/mission'
import Launch from '#models/launch'
import Location from '#models/location'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'

export default class extends BaseSeeder {
  async run() {
    // Ensure a location exists
    const location = await Location.firstOrCreate(
      { name: 'Seed Location' },
      {
        id: uuidv4(),
        name: 'Seed Location',
      }
    )

    // Ensure a launch exists
    const launch = await Launch.firstOrCreate(
      { name: 'Seed Launch' },
      {
        id: uuidv4(),
        name: 'Seed Launch',
        dateTime: DateTime.now().plus({ days: 7 }),
        locationId: location.id,
        summary: 'A launch created for seeding purposes.',
      }
    )

    // Ensure a mission exists to associate the booking with
    const mission = await Mission.firstOrCreate(
      { name: 'Seed Mission' }, // Find condition
      { // Create data if not found
        id: uuidv4(), // Generate a UUID if creating
        launchId: launch.id,
        name: 'Seed Mission',
        active: true,
        public: true,
        salesOpenAt: DateTime.now().minus({ days: 1 }),
        refundCutoffHours: 12,
      }
    )

    // Create a sample booking
    await Booking.create({
      id: uuidv4(),
      confirmationCode: `SEED-${uuidv4().substring(0, 8).toUpperCase()}`,
      missionId: mission.id,
      userName: 'Seed User',
      userEmail: 'seed@example.com',
      userPhone: '123-456-7890',
      billingAddress: '123 Seed St, Seeder City, SD 12345',
      subtotal: 100.00,
      discountAmount: 0.00,
      taxAmount: 8.00,
      tipAmount: 10.00,
      totalAmount: 118.00,
      paymentIntentId: 'pi_seed_example', // Dummy Stripe ID
      specialRequests: 'Seed data booking.',
      // Ensure all required fields are present based on your model
    })

    console.log('Seeded one launch, one mission, and one booking')
  }
} 