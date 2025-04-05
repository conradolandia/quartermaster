import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Trip from './trip.js'
import Boat from './boat.js'

export default class TripBoat extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare tripId: string

  @column()
  declare boatId: string

  @column()
  declare maxCapacity: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Trip)
  declare trip: BelongsTo<typeof Trip>

  @belongsTo(() => Boat)
  declare boat: BelongsTo<typeof Boat>
}