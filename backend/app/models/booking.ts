import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Mission from './mission.js'
import BookingItem from './booking_item.js'
import Payment from './payment.js'

export enum BookingStatus {
  PENDING_PAYMENT = 'pending_payment',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export default class Booking extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare confirmationCode: string

  @column()
  declare missionId: string

  @column()
  declare userName: string

  @column()
  declare userEmail: string

  @column()
  declare userPhone: string

  @column()
  declare billingAddress: string

  @column()
  declare subtotal: number

  @column()
  declare discountAmount: number

  @column()
  declare taxAmount: number

  @column()
  declare tipAmount: number

  @column()
  declare totalAmount: number

  @column()
  declare paymentIntentId: string | null

  @column()
  declare specialRequests: string | null

  @column()
  declare status: BookingStatus

  @column()
  declare launchUpdatesPreference: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Mission)
  declare mission: BelongsTo<typeof Mission>

  @hasMany(() => BookingItem)
  declare bookingItems: HasMany<typeof BookingItem>

  @hasMany(() => Payment)
  declare payments: HasMany<typeof Payment>
}