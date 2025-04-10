import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'
import Location from '#models/location'
import Jurisdiction from '#models/jurisdiction'
import Launch from '#models/launch'
import Mission from '#models/mission'
import BoatProvider from '#models/boat_provider'
import Boat from '#models/boat'
import Trip, { TripType } from '#models/trip'
import TripBoat from '#models/trip_boat'
import Swag from '#models/swag'

export default class extends BaseSeeder {
  async run() {
    // --- Get prerequisite data (Locations, Jurisdictions) ---
    const cape = await Location.findOrFail('cape')
    const starbase = await Location.findOrFail('starbase')
    const capeId = cape.id
    const starbaseId = starbase.id

    const portCanaveral = await Jurisdiction.findOrFail('port_canaveral')
    // const spi = await Jurisdiction.findOrFail('spi') // Not needed if spiId is hardcoded
    const portCanaveralId = portCanaveral.id
    
    // Retrieve the SPI boat ID from the first seeder (assuming it has a fixed ID now)
    const spiBoatId = 'c4b2a1f0-9e8d-4c3b-af2e-7d0b1c2d3e4f' // ID from 01_initial_datum_seeder

    // --- Boat Provider for Cape Canaveral (Idempotent using name) ---
    const providerNameCape = 'Cape Canaveral Cruise Tours'
    await BoatProvider.updateOrCreate(
      { name: providerNameCape }, 
      {
        id: uuidv4(), 
        name: providerNameCape,
        locationDescription: 'Port Canaveral Terminal 5',
        address: '9245 Charles M. Rowland Dr, Port Canaveral, FL 32920',
        jurisdictionId: portCanaveralId,
        mapLink: 'https://maps.google.com/?q=Port+Canaveral+Terminal+5',
      }
    )
    const capeProvider = await BoatProvider.findByOrFail('name', providerNameCape)
    const providerIdCapeDb = capeProvider.id 

    // --- Additional Boats (Create if they don't exist) ---
    const boatsToCreate = [
      {
        name: 'Ocean Explorer',
        capacity: 75,
        providerId: providerIdCapeDb, 
      },
      {
        name: 'Nautical Star', 
        capacity: 60,
        providerId: providerIdCapeDb, 
      }
    ]
    const createdBoatIds: string[] = [] 
    for (const data of boatsToCreate) {
        // Check if boat already exists based on unique key (name + providerId)
        let boat = await Boat.query()
                             .where('name', data.name)
                             .where('providerId', data.providerId)
                             .first()
                             
        if (!boat) {
            // Create if it doesn't exist
            console.log(`Creating boat: ${data.name} for provider ${data.providerId}`)
            boat = await Boat.create({ 
                id: uuidv4(), // Generate UUID for primary key
                ...data 
            })
        } else {
            console.log(`Boat already exists: ${data.name}`)
        }
        createdBoatIds.push(boat!.id) // Add the ID (either existing or newly created)
    }
    const capeBoatIds = createdBoatIds // Use the actual UUIDs

    // --- Additional launches (Idempotent) ---
    const launchesData = [
      {
        id: 'spacex-crew-9',
        name: 'SpaceX Crew-9',
        dateTime: DateTime.fromISO('2024-08-15T14:00:00.000Z'),
        locationId: capeId,
        summary: 'SpaceX Crew Dragon mission to the International Space Station carrying NASA astronauts.',
      },
      {
        id: 'spacex-starship-flight-10',
        name: 'SpaceX Starship Flight 10',
        dateTime: DateTime.fromISO('2024-07-20T16:30:00.000Z'),
        locationId: starbaseId,
        summary: 'Tenth test flight of the SpaceX Starship, aiming to achieve orbital velocity and test reentry.',
      },
      {
        id: 'falcon-heavy-europa-clipper',
        name: 'Falcon Heavy: Europa Clipper',
        dateTime: DateTime.fromISO('2024-10-10T20:00:00.000Z'),
        locationId: capeId,
        summary: "NASA's Europa Clipper mission to study Jupiter's moon Europa, launched on a SpaceX Falcon Heavy.",
      },
      {
        id: 'spacex-starlink-group-9-1',
        name: 'SpaceX Starlink Group 9-1',
        dateTime: DateTime.fromISO('2024-06-05T10:15:00.000Z'),
        locationId: capeId,
        summary: 'A Falcon 9 rocket launching a batch of Starlink satellites to low Earth orbit.',
      }
    ]
    for (const data of launchesData) {
      await Launch.updateOrCreate({ id: data.id }, data)
    }

    // --- Additional missions + Associated Trips/TripBoats (Idempotent) ---
    const missionsData = [
      {
        id: uuidv4(), 
        launchId: 'spacex-crew-9',
        name: 'Crew-9 Mission',
        configId: 'crew-9-mission', 
        salesOpenAt: DateTime.fromISO('2024-06-01T12:00:00.000Z'),
        active: true,
        public: true,
      },
      {
        id: uuidv4(),
        launchId: 'spacex-starship-flight-10',
        name: 'Starship Flight 10 - Orbital Test',
        configId: 'starship-10-orbital',
        salesOpenAt: DateTime.fromISO('2024-06-15T12:00:00.000Z'),
        active: true,
        public: true,
      },
      {
        id: uuidv4(),
        launchId: 'falcon-heavy-europa-clipper',
        name: 'Europa Clipper Launch',
        configId: 'europa-clipper-launch',
        salesOpenAt: DateTime.fromISO('2024-07-01T12:00:00.000Z'),
        active: true,
        public: true,
      },
      {
        id: uuidv4(),
        launchId: 'spacex-starlink-group-9-1',
        name: 'Starlink Group 9-1 Viewing',
        configId: 'starlink-9-1-viewing',
        salesOpenAt: DateTime.fromISO('2024-05-01T12:00:00.000Z'),
        active: true,
        public: true,
      },
      {
        id: uuidv4(),
        launchId: 'spacex-starship-flight-9',
        name: 'Starship Flight 9 - VIP Experience',
        configId: 'starship-9-vip',
        salesOpenAt: DateTime.fromISO('2024-04-20T12:00:00.000Z'),
        active: true,
        public: true,
      }
    ]
    
    for (const data of missionsData) {
      // configId must be unique in the database for this to work correctly
      // Ensure mission exists
      await Mission.updateOrCreate(
        { configId: data.configId }, // Search by unique configId
        data // Provide full data (including generated UUID id)
      )
      // Explicitly fetch the mission AFTER ensuring it exists to get the confirmed ID
      const mission = await Mission.findByOrFail('configId', data.configId)
      
      // --- Create Trip immediately after Mission --- 
      const launch = await Launch.findOrFail(mission.launchId) // Fetch launch using mission's launchId
      const launchDateTime = launch.dateTime

      // Generate trip config_id (must be unique)
      let missionConfigId: string;
      if (mission.configId) { // Use the configId from the mission we just fetched
          missionConfigId = mission.configId
      } else {
          console.warn(`Mission ${mission.id} missing configId, using fallback.`);
          missionConfigId = `fallback-mission-${uuidv4()}`;
      }

      const tripConfigId = `${missionConfigId}-launch-viewing`
      const tripDbId = uuidv4() 

      // Ensure trip exists using the explicitly fetched mission ID
      const trip = await Trip.updateOrCreate(
        { configId: tripConfigId }, 
        {
          id: tripDbId, 
          missionId: mission.id, // Use mission's actual DB UUID fetched above
          type: TripType.LAUNCH_VIEWING,
          configId: tripConfigId,
          active: true,
          checkInTime: launchDateTime.minus({ hours: 2 }),
          boardingTime: launchDateTime.minus({ hours: 1.5 }),
          departureTime: launchDateTime.minus({ hours: 1 }),
        }
      )

      // --- Assign a boat to the trip (Idempotent TripBoat) --- 
      let boatIdToAssign: string;
      if (launch.locationId === capeId) {
        // Use a cape boat ID from the capeBoatIds array created earlier
        boatIdToAssign = capeBoatIds[createdBoatIds.length % capeBoatIds.length] // Simple cycling logic
      } else {
        boatIdToAssign = spiBoatId // Use the hardcoded SPI boat ID
      }
      
      await TripBoat.updateOrCreate(
        { tripId: trip.id, boatId: boatIdToAssign }, 
        {
          id: uuidv4(), 
          maxCapacity: 45, 
        }
      )
    }

    // --- Additional swag items (Idempotent using name) ---
    const swagsData = [
      {
        name: 'Star✦Fleet T-Shirt',
        description: 'Comfortable cotton T-shirt with the Star✦Fleet Tours logo',
        price: 24.99,
        defaultQuantity: 50,
      },
      {
        name: 'Launch Viewing Hat',
        description: 'Adjustable cap with embroidered rocket design',
        price: 19.99,
        defaultQuantity: 30,
      },
      {
        name: 'Commemorative Mission Patch',
        description: 'Limited edition mission patch for collectors',
        price: 12.99,
        defaultQuantity: 100,
      }
    ]
    for (const data of swagsData) {
        await Swag.updateOrCreate(
          { name: data.name }, // Search by name
          {
            id: uuidv4(), // Generate UUID for primary key
            ...data, // Spread the rest of the data
          }
        )
    }
  }
} 