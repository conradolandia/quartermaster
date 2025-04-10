import { inject } from '@adonisjs/core'
import app from '@adonisjs/core/services/app'
import fs from 'node:fs'
import yaml from 'js-yaml'
import { Exception } from '@adonisjs/core/exceptions'

// --- Type Definitions for Configuration Structure ---
interface PricingConfig {
  adult_ticket?: number
  child_ticket?: number
  [key: string]: number | undefined // Allow other item types
}

interface BoatConfig {
  boat_id: string
  max_capacity?: number // Optional override
}

interface TripConfig {
  id: string
  type: 'launch_viewing' | 'pre_launch'
  check_in_time: string // ISO Date string
  boarding_time: string // ISO Date string
  departure_time: string // ISO Date string
  pricing: PricingConfig
  boats: BoatConfig[]
}

interface MissionConfig {
  id: string
  name: string
  launch_id: string
  active: boolean
  public: boolean
  sales_open_at: string // ISO Date string
  refund_cutoff_hours: number
  trips: TripConfig[]
}

interface LaunchConfig {
  id: string
  name: string
  date_time: string // ISO Date string
  location_id: string
}

interface MissionYamlStructure {
  launch: LaunchConfig
  missions: MissionConfig[]
}
// --- End Type Definitions ---

@inject()
export default class MissionConfigService {
  private config!: MissionYamlStructure

  constructor() {
    this.loadConfig()
  }

  private loadConfig() {
    // const configPath = app.configPath('missions.yml') // Old way
    // const configPath = app.makePath('config', 'missions.yml') // Previous attempt
    const configPath = app.makePath('data', 'missions.yml') // New location: data directory
    // Log the path being used by the service during runtime/test
    console.log(`[MissionConfigService] CWD: ${process.cwd()}`)
    console.log(`[MissionConfigService] Attempting to load config from: ${configPath}`)
    try {
      const fileContents = fs.readFileSync(configPath, 'utf8')
      this.config = yaml.load(fileContents) as MissionYamlStructure

      // Basic validation (can be expanded)
      if (!this.config || !this.config.launch || !Array.isArray(this.config.missions)) {
        throw new Error('Invalid missions.yml structure')
      }
    } catch (error) {
      // Log the error for debugging
      console.error('Error loading missions.yml:', error)
      // Throw a more specific application exception
      throw new Exception(
        `Failed to load or parse mission configuration from ${configPath}: ${error.message}`,
        {
          code: 'E_MISSION_CONFIG_LOAD_FAILED',
          status: 500,
        }
      )
    }
  }

  /**
   * Reloads the configuration from the YAML file.
   * Useful if the file is updated while the server is running (though requires restart in typical setups).
   */
  public reloadConfig() {
    this.loadConfig()
  }

  /**
   * Retrieves the configuration for a specific launch.
   */
  public getLaunchConfig(launchId: string): LaunchConfig | undefined {
    // In this structure, there's only one top-level launch config
    // Adjust if your YAML structure allows multiple launches
    if (this.config.launch?.id === launchId) {
      return this.config.launch
    }
    return undefined
  }

  /**
   * Retrieves the configuration for a specific mission.
   */
  public getMissionConfig(missionId: string): MissionConfig | undefined {
    return this.config.missions.find((mission) => mission.id === missionId)
  }

  /**
   * Retrieves the configuration for all missions associated with a specific launch.
   */
  public getMissionsForLaunch(launchId: string): MissionConfig[] {
    return this.config.missions.filter((mission) => mission.launch_id === launchId)
  }

  /**
   * Retrieves the configuration for a specific trip within a mission.
   */
  public getTripConfig(missionId: string, tripId: string): TripConfig | undefined {
    const mission = this.getMissionConfig(missionId)
    return mission?.trips.find((trip) => trip.id === tripId)
  }

  /**
   * Retrieves the price for a specific item type on a specific trip.
   */
  public getTripPrice(missionId: string, tripId: string, itemType: string): number | undefined {
    const trip = this.getTripConfig(missionId, tripId)
    return trip?.pricing[itemType]
  }

  /**
   * Retrieves the specific capacity configuration for a boat on a trip.
   * Note: This returns the override capacity if set, otherwise undefined.
   * We might need another service/model lookup to get the boat's default capacity.
   */
  public getBoatConfig(missionId: string, tripId: string, boatId: string): BoatConfig | undefined {
    const trip = this.getTripConfig(missionId, tripId)
    return trip?.boats.find((boat) => boat.boat_id === boatId)
  }

  /**
   * Retrieves the list of all configured missions.
   */
  public getAllMissions(): MissionConfig[] {
    return this.config.missions
  }

  // Add more getter methods as needed, e.g., getAllLaunchConfigs if structure changes
} 