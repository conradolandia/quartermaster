import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Location from './location.js'
import BoatProvider from './boat_provider.js'

export default class Jurisdiction extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare state: string

  @column()
  declare salesTaxRate: number

  @column()
  declare locationId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Location)
  declare location: BelongsTo<typeof Location>

  @hasMany(() => BoatProvider)
  declare boatProviders: HasMany<typeof BoatProvider>
}