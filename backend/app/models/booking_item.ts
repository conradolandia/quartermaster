import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Booking from './booking.js'
import Trip from './trip.js'
import Boat from './boat.js'

export enum ItemType {
  ADULT_TICKET = 'adult_ticket',
  CHILD_TICKET = 'child_ticket',
  SWAG = 'swag',
}

export enum ItemStatus {
  ACTIVE = 'active',
  REFUNDED = 'refunded',
  FULFILLED = 'fulfilled',
}

export enum RefundReason {
  CHANGE_IN_PARTY_SIZE = 'change_in_party_size',
  COULD_NOT_MAKE_DATE = 'could_not_make_date',
  UNSATISFIED = 'unsatisfied',
  OTHER = 'other',
}

export default class BookingItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare bookingId: string

  @column()
  declare tripId: string | null

  @column()
  declare boatId: string | null

  @column()
  declare itemType: ItemType

  @column()
  declare quantity: number

  @column()
  declare pricePerUnit: number

  @column()
  declare status: ItemStatus

  @column()
  declare refundReason: RefundReason | null

  @column()
  declare refundNotes: string | null

  @column.dateTime()
  declare refundedAt: DateTime | null

  @column()
  declare attributes: any | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Booking)
  declare booking: BelongsTo<typeof Booking>

  @belongsTo(() => Trip)
  declare trip: BelongsTo<typeof Trip>

  @belongsTo(() => Boat)
  declare boat: BelongsTo<typeof Boat>
}