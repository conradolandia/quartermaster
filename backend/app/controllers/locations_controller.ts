import type { HttpContext } from '@adonisjs/core/http'
import Location from '#models/location'
import { createLocationValidator, updateLocationValidator } from '#validators/location_validator'

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
    const payload = await request.validateUsing(createLocationValidator)
    
    const location = await Location.create({
      name: payload.name,
    })

    return response.status(201).json(location)
  }

  /**
   * Update a location
   */
  async update({ params, request, response }: HttpContext) {
    const { id } = params
    const location = await Location.findOrFail(id)
    
    const payload = await request.validateUsing(updateLocationValidator)

    if (payload.name) {
      location.name = payload.name
    }
    
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