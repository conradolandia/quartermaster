import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import { v4 as uuidv4 } from 'uuid'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Launch from './launch.js'
import Jurisdiction from './jurisdiction.js'

export default class Location extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Launch)
  declare launches: HasMany<typeof Launch>

  @hasMany(() => Jurisdiction)
  declare jurisdictions: HasMany<typeof Jurisdiction>

  @beforeCreate()
  static assignUuid(location: Location) {
    location.id = uuidv4()
  }
}