import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Jurisdiction from './jurisdiction.js'
import Boat from './boat.js'

export default class BoatProvider extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare locationDescription: string

  @column()
  declare address: string

  @column()
  declare jurisdictionId: string

  @column()
  declare mapLink: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Jurisdiction)
  declare jurisdiction: BelongsTo<typeof Jurisdiction>

  @hasMany(() => Boat)
  declare boats: HasMany<typeof Boat>
}