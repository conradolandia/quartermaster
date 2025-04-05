import type { HttpContext } from '@adonisjs/core/http'
import Location from '#models/location'
import { v4 as uuidv4 } from 'uuid'

export default class LocationsController {
  /**
   * Display a list of all locations
   */
  async index({ response }: HttpContext) {
    const locations = await Location.query().preload('launches')
    return response.json(locations)
  }

  /**
   * Display a specific location
   */
  async show({ params, response }: HttpContext) {
    const { id } = params
    const location = await Location.findOrFail(id)
    await location.load('launches')
    return response.json(location)
  }

  /**
   * Create a new location
   */
  async store({ request, response }: HttpContext) {
    const data = request.only(['name'])

    const location = await Location.create({
      name: data.name,
    })

    return response.status(201).json(location)
  }

  /**
   * Update a location
   */
  async update({ params, request, response }: HttpContext) {
    const { id } = params
    const location = await Location.findOrFail(id)
    
    const data = request.only(['name'])

    location.name = data.name || location.name
    await location.save()
    
    return response.json(location)
  }

  /**
   * Delete a location
   */
  async destroy({ params, response }: HttpContext) {
    const { id } = params
    const location = await Location.findOrFail(id)
    await location.delete()
    
    return response.status(204).noContent()
  }
} 