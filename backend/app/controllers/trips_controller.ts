import type { HttpContext } from '@adonisjs/core/http'
import Trip, { TripType } from '#models/trip'
import { v4 as uuidv4 } from 'uuid'
import { DateTime } from 'luxon'
import { createTripValidator, updateTripValidator } from '#validators/trip_validator'

export default class TripsController {
  /**
   * Display a list of all trips
   */
  async index({ response }: HttpContext) {
    const trips = await Trip.query().preload('mission')
    return response.json(trips)
  }

  /**
   * Display a specific trip
   */
  async show({ params, response }: HttpContext) {
    const { id } = params
    const trip = await Trip.findOrFail(id)
    await trip.load('mission')
    await trip.load('tripBoats')
    return response.json(trip)
  }

  /**
   * Create a new trip
   */
  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createTripValidator)

    const trip = await Trip.create({
      id: uuidv4(),
      missionId: payload.mission_id,
      type: payload.type ? payload.type as TripType : TripType.LAUNCH_VIEWING,
      departureTime: payload.departure_time ? DateTime.fromISO(payload.departure_time) : DateTime.now(),
      boardingTime: payload.boarding_time ? DateTime.fromISO(payload.boarding_time) : DateTime.now(),
      checkInTime: payload.check_in_time ? DateTime.fromISO(payload.check_in_time) : DateTime.now(),
      active: payload.active !== undefined ? payload.active : true,
    })

    await trip.load('mission')
    return response.status(201).json(trip)
  }

  /**
   * Update a trip
   */
  async update({ params, request, response }: HttpContext) {
    const { id } = params
    const trip = await Trip.findOrFail(id)
    
    const payload = await request.validateUsing(updateTripValidator)

    if (payload.mission_id) trip.missionId = payload.mission_id
    if (payload.type) trip.type = payload.type as TripType
    if (payload.departure_time) trip.departureTime = DateTime.fromISO(payload.departure_time)
    if (payload.boarding_time) trip.boardingTime = DateTime.fromISO(payload.boarding_time)
    if (payload.check_in_time) trip.checkInTime = DateTime.fromISO(payload.check_in_time)
    if (payload.active !== undefined) trip.active = payload.active

    await trip.save()
    await trip.load('mission')
    
    return response.json(trip)
  }

  /**
   * Delete a trip
   */
  async destroy({ params, response }: HttpContext) {
    const { id } = params
    const trip = await Trip.findOrFail(id)
    await trip.delete()
    
    return response.status(204).noContent()
  }
} 