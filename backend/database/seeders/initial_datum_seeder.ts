import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { v4 as uuidv4 } from 'uuid'

export default class extends BaseSeeder {
  async run() {
    // Create admin user
    await db.table('admin_users').insert({
      id: uuidv4(),
      name: 'Admin User',
      email: 'admin@starfleet.tours',
      password: await hash.make('password'),
      role: 'admin',
      created_at: DateTime.now().toSQL(),
      updated_at: DateTime.now().toSQL(),
    })

    // Create locations
    const capeId = 'cape'
    const starbaseId = 'starbase'
    
    await db.table('locations').insert([
      {
        id: capeId,
        name: 'Cape Canaveral',
        created_at: DateTime.now().toSQL(),
        updated_at: DateTime.now().toSQL(),
      },
      {
        id: starbaseId,
        name: 'Starbase',
        created_at: DateTime.now().toSQL(),
        updated_at: DateTime.now().toSQL(),
      },
    ])

    // Create jurisdictions
    const portCanaveralId = 'port_canaveral'
    const spiId = 'spi'
    
    await db.table('jurisdictions').insert([
      {
        id: portCanaveralId,
        name: 'Port Canaveral',
        state: 'Florida',
        sales_tax_rate: 6.5,
        location_id: capeId,
        created_at: DateTime.now().toSQL(),
        updated_at: DateTime.now().toSQL(),
      },
      {
        id: spiId,
        name: 'South Padre Island',
        state: 'Texas',
        sales_tax_rate: 8.25,
        location_id: starbaseId,
        created_at: DateTime.now().toSQL(),
        updated_at: DateTime.now().toSQL(),
      },
    ])

    // Create a launch
    const launchId = 'spacex-starship-flight-9'
    await db.table('launches').insert({
      id: launchId,
      name: 'SpaceX Starship Flight 9',
      date_time: DateTime.fromISO('2024-05-30T18:00:00.000Z').toSQL(),
      location_id: starbaseId,
      summary: 'The SpaceX Starship, the most powerful rocket in history, will attempt once again to launch and land.',
      created_at: DateTime.now().toSQL(),
      updated_at: DateTime.now().toSQL(),
    })

    // Create a mission
    const missionId = uuidv4()
    await db.table('missions').insert({
      id: missionId,
      launch_id: launchId,
      name: 'Starship Flight 9 - Attempt 1',
      sales_open_at: DateTime.fromISO('2024-04-15T12:00:00.000Z').toSQL(),
      active: true,
      public: true,
      refund_cutoff_hours: 12,
      created_at: DateTime.now().toSQL(),
      updated_at: DateTime.now().toSQL(),
    })

    // Create boat providers
    const providerIdSpi = uuidv4()
    await db.table('boat_providers').insert({
      id: providerIdSpi,
      name: 'South Padre Island Boat Tours',
      location_description: 'South Padre Island Main Dock',
      address: '123 Harbor Blvd, South Padre Island, TX 78597',
      jurisdiction_id: spiId,
      map_link: 'https://maps.google.com/?q=South+Padre+Island+Main+Dock',
      created_at: DateTime.now().toSQL(),
      updated_at: DateTime.now().toSQL(),
    })

    // Create boats
    const boatId = uuidv4()
    await db.table('boats').insert({
      id: boatId,
      name: 'Sea Star',
      capacity: 50,
      provider_id: providerIdSpi,
      created_at: DateTime.now().toSQL(),
      updated_at: DateTime.now().toSQL(),
    })

    // Create a trip
    const tripId = uuidv4()
    const launchDateTime = DateTime.fromISO('2024-05-30T18:00:00.000Z')
    await db.table('trips').insert({
      id: tripId,
      mission_id: missionId,
      type: 'launch_viewing',
      active: true,
      check_in_time: launchDateTime.minus({ hours: 2 }).toSQL(),
      boarding_time: launchDateTime.minus({ hours: 1.5 }).toSQL(),
      departure_time: launchDateTime.minus({ hours: 1 }).toSQL(),
      created_at: DateTime.now().toSQL(),
      updated_at: DateTime.now().toSQL(),
    })

    // Create trip boat
    await db.table('trip_boats').insert({
      id: uuidv4(),
      trip_id: tripId,
      boat_id: boatId,
      max_capacity: 45,
      created_at: DateTime.now().toSQL(),
      updated_at: DateTime.now().toSQL(),
    })

    // Create swag item
    await db.table('swags').insert({
      id: uuidv4(),
      name: 'Star✦Fleet Decal',
      description: 'High-quality vinyl decal with the Star✦Fleet Tours logo',
      price: 5.99,
      default_quantity: 100,
      created_at: DateTime.now().toSQL(),
      updated_at: DateTime.now().toSQL(),
    })
  }
}