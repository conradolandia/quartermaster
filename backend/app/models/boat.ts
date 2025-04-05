import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import BoatProvider from './boat_provider.js'
import Trip from './trip.js'
import TripBoat from './trip_boat.js'
import BookingItem from './booking_item.js'

export default class Boat extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare capacity: number

  @column()
  declare providerId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => BoatProvider, {
    foreignKey: 'providerId',
  })
  declare provider: BelongsTo<typeof BoatProvider>

  @manyToMany(() => Trip, {
    pivotTable: 'trip_boats',
    pivotForeignKey: 'boat_id',
    pivotRelatedForeignKey: 'trip_id',
    pivotColumns: ['max_capacity'],
  })
  declare trips: ManyToMany<typeof Trip>

  @hasMany(() => TripBoat)
  declare tripBoats: HasMany<typeof TripBoat>

  @hasMany(() => BookingItem)
  declare bookingItems: HasMany<typeof BookingItem>
}