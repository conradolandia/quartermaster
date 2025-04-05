import type { HttpContext } from '@adonisjs/core/http'
import Launch from '#models/launch'
import { v4 as uuidv4 } from 'uuid'
import { DateTime } from 'luxon'

export default class LaunchesController {
  /**
   * Display a list of all launches
   */
  async index({ response }: HttpContext) {
    const launches = await Launch.query().preload('location')
    return response.json(launches)
  }

  /**
   * Display a specific launch
   */
  async show({ params, response }: HttpContext) {
    const { id } = params
    const launch = await Launch.findOrFail(id)
    await launch.load('location')
    return response.json(launch)
  }

  /**
   * Create a new launch
   */
  async store({ request, response }: HttpContext) {
    const data = request.only([
      'location_id',
      'name',
      'date_time',
    ])

    const launch = await Launch.create({
      id: uuidv4(),
      locationId: data.location_id,
      name: data.name,
      dateTime: data.date_time ? DateTime.fromISO(data.date_time) : DateTime.now(),
    })

    await launch.load('location')
    return response.status(201).json(launch)
  }

  /**
   * Update a launch
   */
  async update({ params, request, response }: HttpContext) {
    const { id } = params
    const launch = await Launch.findOrFail(id)
    
    const data = request.only([
      'location_id',
      'name',
      'date_time',
    ])

    launch.locationId = data.location_id || launch.locationId
    launch.name = data.name || launch.name
    if (data.date_time) launch.dateTime = DateTime.fromISO(data.date_time)

    await launch.save()
    await launch.load('location')
    
    return response.json(launch)
  }

  /**
   * Delete a launch
   */
  async destroy({ params, response }: HttpContext) {
    const { id } = params
    const launch = await Launch.findOrFail(id)
    await launch.delete()
    
    return response.status(204).noContent()
  }
} 