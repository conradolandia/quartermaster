import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { v4 as uuidv4 } from 'uuid'
import AdminUser, { AdminRole } from '#models/admin_user'
import Location from '#models/location'
import Jurisdiction from '#models/jurisdiction'
import Launch from '#models/launch'
import Mission from '#models/mission'
import BoatProvider from '#models/boat_provider'
import Boat from '#models/boat'
import Trip from '#models/trip'
import TripBoat from '#models/trip_boat'
import Swag from '#models/swag'
import { TripType } from '#models/trip'

export default class extends BaseSeeder {
  async run() {
    try {
      // Create admin user using firstOrCreate with enum
      await AdminUser.firstOrCreate(
        { email: 'admin@starfleet.tours' },
        {
          name: 'Admin User',
          email: 'admin@starfleet.tours',
          password: await hash.make('password'),
          role: AdminRole.ADMIN,
        }
      )
      console.log('Admin user created')

      // Create locations without explicit IDs to let the model handle it
      const capeLocation = await Location.create({ name: 'Cape Canaveral' })
      console.log('Cape location created with ID:', capeLocation.id)
      
      const starbaseLocation = await Location.create({ name: 'Starbase' })
      console.log('Starbase location created with ID:', starbaseLocation.id)
      
      // Now create jurisdictions using the location IDs from the created locations
      const portCanaveralJurisdiction = await Jurisdiction.create({
        id: 'port_canaveral', // We can still use explicit IDs for jurisdictions
        name: 'Port Canaveral',
        state: 'Florida',
        salesTaxRate: 6.5,
        locationId: capeLocation.id // Use the generated ID
      })
      console.log('Port Canaveral jurisdiction created')
      
      const spiJurisdiction = await Jurisdiction.create({
        id: 'spi',
        name: 'South Padre Island',
        state: 'Texas',
        salesTaxRate: 8.25,
        locationId: starbaseLocation.id // Use the generated ID
      })
      console.log('SPI jurisdiction created')
      
      // Create a launch
      const launch = await Launch.create({ 
        id: 'spacex-starship-flight-9',
        name: 'SpaceX Starship Flight 9',
        dateTime: DateTime.fromISO('2024-05-30T18:00:00.000Z'),
        locationId: starbaseLocation.id, // Use the generated ID
        summary: 'The SpaceX Starship, the most powerful rocket in history, will attempt once again to launch and land.'
      })
      console.log('Launch created')

      // Create a mission
      const mission = await Mission.create({ 
        id: 'f3d9c2a0-74e1-4b1f-8f4e-9d6a1b2c3d4e',
        launchId: launch.id,
        name: 'Starship Flight 9 - Attempt 1',
        configId: 'starship-flight-9-attempt-1',
        salesOpenAt: DateTime.fromISO('2024-04-15T12:00:00.000Z'),
        active: true,
        public: true
      })
      console.log('Mission created')

      // Create boat providers
      const provider = await BoatProvider.create({
        id: 'b1a8f3c5-0d7e-4a2b-8c1f-6e9d0a1b2c3d',
        name: 'South Padre Island Boat Tours',
        locationDescription: 'South Padre Island Main Dock',
        address: '123 Harbor Blvd, South Padre Island, TX 78597',
        jurisdictionId: spiJurisdiction.id,
        mapLink: 'https://maps.google.com/?q=South+Padre+Island+Main+Dock'
      })
      console.log('Boat provider created')

      // Create boats
      const boat = await Boat.create({
        id: 'c4b2a1f0-9e8d-4c3b-af2e-7d0b1c2d3e4f',
        name: 'Sea Star',
        capacity: 50,
        providerId: provider.id
      })
      console.log('Boat created')

      // Create a trip
      const launchDateTime = DateTime.fromISO('2024-05-30T18:00:00.000Z')
      const trip = await Trip.create({
        id: 'd5e3b0d9-8f7e-4d2c-bf1d-8e1c2d3e4f5a',
        missionId: mission.id,
        type: TripType.LAUNCH_VIEWING,
        configId: 'starship-flight-9-launch-viewing',
        active: true,
        checkInTime: launchDateTime.minus({ hours: 2 }),
        boardingTime: launchDateTime.minus({ hours: 1.5 }),
        departureTime: launchDateTime.minus({ hours: 1 })
      })
      console.log('Trip created')

      // Create trip boat
      await TripBoat.create({
        id: uuidv4(),
        tripId: trip.id,
        boatId: boat.id,
        maxCapacity: 45
      })
      console.log('Trip boat created')

      // Create swag item
      await Swag.create({
        id: uuidv4(),
        name: 'Star✦Fleet Decal',
        description: 'High-quality vinyl decal with the Star✦Fleet Tours logo',
        price: 5.99,
        defaultQuantity: 100
      })
      console.log('Swag created')
      
      console.log('All seed data created successfully')
    } catch (error) {
      console.error('Error in initial seeder:', error)
      throw error
    }
  }
}