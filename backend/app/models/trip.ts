import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany, HasMany } from '@adonisjs/lucid/types/relations'
import Mission from './mission.js'
import Boat from './boat.js'
import TripBoat from './trip_boat.js'
import BookingItem from './booking_item.js'

export enum TripType {
  LAUNCH_VIEWING = 'launch_viewing',
  PRE_LAUNCH = 'pre_launch',
}

export default class Trip extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare missionId: string

  @column()
  declare type: TripType

  @column()
  declare active: boolean

  @column.dateTime()
  declare checkInTime: DateTime

  @column.dateTime()
  declare boardingTime: DateTime

  @column.dateTime()
  declare departureTime: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Mission)
  declare mission: BelongsTo<typeof Mission>

  @manyToMany(() => Boat, {
    pivotTable: 'trip_boats',
    pivotForeignKey: 'trip_id',
    pivotRelatedForeignKey: 'boat_id',
    pivotColumns: ['max_capacity'],
  })
  declare boats: ManyToMany<typeof Boat>

  @hasMany(() => TripBoat)
  declare tripBoats: HasMany<typeof TripBoat>

  @hasMany(() => BookingItem)
  declare bookingItems: HasMany<typeof BookingItem>
}