import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Location from './location.js'
import Mission from './mission.js'

export default class Launch extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column.dateTime()
  declare dateTime: DateTime

  @column()
  declare locationId: string

  @column()
  declare summary: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Location)
  declare location: BelongsTo<typeof Location>

  @hasMany(() => Mission)
  declare missions: HasMany<typeof Mission>
}