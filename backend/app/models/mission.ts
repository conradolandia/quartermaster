import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Launch from './launch.js'
import Trip from './trip.js'
import Booking from './booking.js'

export default class Mission extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare launchId: string

  @column()
  declare name: string

  @column.dateTime()
  declare salesOpenAt: DateTime

  @column()
  declare active: boolean

  @column()
  declare public: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Launch)
  declare launch: BelongsTo<typeof Launch>

  @hasMany(() => Trip)
  declare trips: HasMany<typeof Trip>

  @hasMany(() => Booking)
  declare bookings: HasMany<typeof Booking>
}