import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'

export default class extends BaseSeeder {
  async run() {
    // Get existing locations
    const locations = await db.from('locations').select('*')
    const capeId = locations.find(l => l.id === 'cape')?.id || 'cape'
    const starbaseId = locations.find(l => l.id === 'starbase')?.id || 'starbase'

    // Additional launches
    const launches = [
      {
        id: 'spacex-crew-9',
        name: 'SpaceX Crew-9',
        date_time: DateTime.fromISO('2024-08-15T14:00:00.000Z').toISO(),
        location_id: capeId,
        summary: 'SpaceX Crew Dragon mission to the International Space Station carrying NASA astronauts.',
        created_at: DateTime.now().toISO(),
        updated_at: DateTime.now().toISO(),
      },
      {
        id: 'spacex-starship-flight-10',
        name: 'SpaceX Starship Flight 10',
        date_time: DateTime.fromISO('2024-07-20T16:30:00.000Z').toISO(),
        location_id: starbaseId,
        summary: 'Tenth test flight of the SpaceX Starship, aiming to achieve orbital velocity and test reentry.',
        created_at: DateTime.now().toISO(),
        updated_at: DateTime.now().toISO(),
      },
      {
        id: 'falcon-heavy-europa-clipper',
        name: 'Falcon Heavy: Europa Clipper',
        date_time: DateTime.fromISO('2024-10-10T20:00:00.000Z').toISO(),
        location_id: capeId,
        summary: 'NASA\'s Europa Clipper mission to study Jupiter\'s moon Europa, launched on a SpaceX Falcon Heavy.',
        created_at: DateTime.now().toISO(),
        updated_at: DateTime.now().toISO(),
      },
      {
        id: 'spacex-starlink-group-9-1',
        name: 'SpaceX Starlink Group 9-1',
        date_time: DateTime.fromISO('2024-06-05T10:15:00.000Z').toISO(),
        location_id: capeId,
        summary: 'A Falcon 9 rocket launching a batch of Starlink satellites to low Earth orbit.',
        created_at: DateTime.now().toISO(),
        updated_at: DateTime.now().toISO(),
      }
    ]

    await db.table('launches').multiInsert(launches)

    // Create additional missions
    const missions = [
      {
        id: uuidv4(),
        launch_id: 'spacex-crew-9',
        name: 'Crew-9 Mission',
        sales_open_at: DateTime.fromISO('2024-06-01T12:00:00.000Z').toISO(),
        active: true,
        public: true,
        created_at: DateTime.now().toISO(),
        updated_at: DateTime.now().toISO(),
      },
      {
        id: uuidv4(),
        launch_id: 'spacex-starship-flight-10',
        name: 'Starship Flight 10 - Orbital Test',
        sales_open_at: DateTime.fromISO('2024-06-15T12:00:00.000Z').toISO(),
        active: true,
        public: true,
        created_at: DateTime.now().toISO(),
        updated_at: DateTime.now().toISO(),
      },
      {
        id: uuidv4(),
        launch_id: 'falcon-heavy-europa-clipper',
        name: 'Europa Clipper Launch',
        sales_open_at: DateTime.fromISO('2024-07-01T12:00:00.000Z').toISO(),
        active: true,
        public: true,
        created_at: DateTime.now().toISO(),
        updated_at: DateTime.now().toISO(),
      },
      {
        id: uuidv4(),
        launch_id: 'spacex-starlink-group-9-1',
        name: 'Starlink Group 9-1 Viewing',
        sales_open_at: DateTime.fromISO('2024-05-01T12:00:00.000Z').toISO(),
        active: true,
        public: true,
        created_at: DateTime.now().toISO(),
        updated_at: DateTime.now().toISO(),
      },
      {
        id: uuidv4(),
        launch_id: 'spacex-starship-flight-9',
        name: 'Starship Flight 9 - VIP Experience',
        sales_open_at: DateTime.fromISO('2024-04-20T12:00:00.000Z').toISO(),
        active: true,
        public: true,
        created_at: DateTime.now().toISO(),
        updated_at: DateTime.now().toISO(),
      }
    ]

    // Insert all missions and keep track of their IDs
    const missionIds = []
    for (const mission of missions) {
      const id = mission.id
      await db.table('missions').insert(mission)
      missionIds.push(id)
    }

    // Get jurisdictions and boat providers
    const jurisdictions = await db.from('jurisdictions').select('*')
    const portCanaveralId = jurisdictions.find(j => j.id === 'port_canaveral')?.id || 'port_canaveral'

    // Add another boat provider for Cape Canaveral
    const providerIdCape = uuidv4()
    await db.table('boat_providers').insert({
      id: providerIdCape,
      name: 'Cape Canaveral Cruise Tours',
      location_description: 'Port Canaveral Terminal 5',
      address: '9245 Charles M. Rowland Dr, Port Canaveral, FL 32920',
      jurisdiction_id: portCanaveralId,
      map_link: 'https://maps.google.com/?q=Port+Canaveral+Terminal+5',
      created_at: DateTime.now().toISO(),
      updated_at: DateTime.now().toISO(),
    })

    // Add more boats
    const boats = [
      {
        id: uuidv4(),
        name: 'Ocean Explorer',
        capacity: 75,
        provider_id: providerIdCape,
        created_at: DateTime.now().toISO(),
        updated_at: DateTime.now().toISO(),
      },
      {
        id: uuidv4(),
        name: 'Nautical Star',
        capacity: 60,
        provider_id: providerIdCape,
        created_at: DateTime.now().toISO(),
        updated_at: DateTime.now().toISO(),
      }
    ]
    
    const boatIds = []
    for (const boat of boats) {
      const id = boat.id
      await db.table('boats').insert(boat)
      boatIds.push(id)
    }

    // Create trips for each mission
    for (let i = 0; i < missionIds.length; i++) {
      const missionId = missionIds[i]
      // Find the corresponding launch to get the date
      const mission = missions[i]
      const launch = launches.find(l => l.id === mission.launch_id)
      
      let launchDateTime;
      if (launch) {
        launchDateTime = DateTime.fromISO(launch.date_time || '')
      } else {
        // If not found in our new launches, fetch from the database
        const dbLaunch = await db.from('launches').where('id', mission.launch_id).first()
        launchDateTime = DateTime.fromISO(dbLaunch.date_time)
      }
      
      // Create a trip for this mission
      const tripId = uuidv4()
      await db.table('trips').insert({
        id: tripId,
        mission_id: missionId,
        type: 'launch_viewing',
        active: true,
        check_in_time: launchDateTime.minus({ hours: 2 }).toISO(),
        boarding_time: launchDateTime.minus({ hours: 1.5 }).toISO(),
        departure_time: launchDateTime.minus({ hours: 1 }).toISO(),
        created_at: DateTime.now().toISO(),
        updated_at: DateTime.now().toISO(),
      })
      
      // Assign a boat to the trip
      // Use location to determine which boat provider to use
      let locationId;
      if (launch) {
        locationId = launch.location_id
      } else {
        const dbLaunch = await db.from('launches').where('id', mission.launch_id).first()
        locationId = dbLaunch.location_id
      }
      
      let boatId;
      if (locationId === capeId) {
        // For Cape Canaveral, use one of our new boats
        boatId = boatIds[i % boatIds.length]
      } else {
        // For other locations, query for a boat with the right provider
        const boat = await db.from('boats')
          .whereIn('provider_id', 
            db.from('boat_providers')
              .whereIn('jurisdiction_id', 
                db.from('jurisdictions')
                  .where('location_id', locationId)
                  .select('id')
              )
              .select('id')
          )
          .first()
        
        boatId = boat.id
      }
      
      await db.table('trip_boats').insert({
        id: uuidv4(),
        trip_id: tripId,
        boat_id: boatId,
        max_capacity: 45,
        created_at: DateTime.now().toISO(),
        updated_at: DateTime.now().toISO(),
      })
    }

    // Additional swag items
    const swags = [
      {
        id: uuidv4(),
        name: 'Star✦Fleet T-Shirt',
        description: 'Comfortable cotton T-shirt with the Star✦Fleet Tours logo',
        price: 24.99,
        default_quantity: 50,
        created_at: DateTime.now().toISO(),
        updated_at: DateTime.now().toISO(),
      },
      {
        id: uuidv4(),
        name: 'Launch Viewing Hat',
        description: 'Adjustable cap with embroidered rocket design',
        price: 19.99,
        default_quantity: 30,
        created_at: DateTime.now().toISO(),
        updated_at: DateTime.now().toISO(),
      },
      {
        id: uuidv4(),
        name: 'Commemorative Mission Patch',
        description: 'Limited edition mission patch for collectors',
        price: 12.99,
        default_quantity: 100,
        created_at: DateTime.now().toISO(),
        updated_at: DateTime.now().toISO(),
      }
    ]
    
    await db.table('swags').multiInsert(swags)
  }
} 