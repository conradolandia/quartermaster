import type { HttpContext } from '@adonisjs/core/http'
import Trip, { TripType } from '#models/trip'
import { v4 as uuidv4 } from 'uuid'
import { DateTime } from 'luxon'

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
    const data = request.only([
      'mission_id',
      'type',
      'departure_time',
      'boarding_time',
      'check_in_time',
      'active',
    ])

    const trip = await Trip.create({
      id: uuidv4(),
      missionId: data.mission_id,
      type: data.type || TripType.LAUNCH_VIEWING,
      departureTime: data.departure_time ? DateTime.fromISO(data.departure_time) : DateTime.now(),
      boardingTime: data.boarding_time ? DateTime.fromISO(data.boarding_time) : DateTime.now(),
      checkInTime: data.check_in_time ? DateTime.fromISO(data.check_in_time) : DateTime.now(),
      active: data.active !== undefined ? data.active : true,
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
    
    const data = request.only([
      'mission_id',
      'type',
      'departure_time',
      'boarding_time',
      'check_in_time',
      'active',
    ])

    trip.missionId = data.mission_id || trip.missionId
    if (data.type) trip.type = data.type
    if (data.departure_time) trip.departureTime = DateTime.fromISO(data.departure_time)
    if (data.boarding_time) trip.boardingTime = DateTime.fromISO(data.boarding_time)
    if (data.check_in_time) trip.checkInTime = DateTime.fromISO(data.check_in_time)
    if (data.active !== undefined) trip.active = data.active

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