import type { HttpContext } from '@adonisjs/core/http'
import Mission from '#models/mission'
import { v4 as uuidv4 } from 'uuid'

export default class MissionsController {
  /**
   * Display a list of all missions
   */
  async index({ response }: HttpContext) {
    const missions = await Mission.query().preload('launch')
    return response.json(missions)
  }

  /**
   * Display a specific mission
   */
  async show({ params, response }: HttpContext) {
    const { id } = params
    const mission = await Mission.findOrFail(id)
    await mission.load('launch')
    return response.json(mission)
  }

  /**
   * Create a new mission
   */
  async store({ request, response }: HttpContext) {
    const data = request.only([
      'launch_id',
      'name',
      'sales_open_at',
      'active',
      'public',
    ])

    const mission = await Mission.create({
      id: uuidv4(),
      launchId: data.launch_id,
      name: data.name,
      salesOpenAt: data.sales_open_at,
      active: data.active || false,
      public: data.public || false,
    })

    await mission.load('launch')
    return response.status(201).json(mission)
  }

  /**
   * Update a mission
   */
  async update({ params, request, response }: HttpContext) {
    const { id } = params
    const mission = await Mission.findOrFail(id)
    
    const data = request.only([
      'launch_id',
      'name',
      'sales_open_at',
      'active',
      'public',
    ])

    mission.launchId = data.launch_id || mission.launchId
    mission.name = data.name || mission.name
    if (data.sales_open_at) mission.salesOpenAt = data.sales_open_at
    if (data.active !== undefined) mission.active = data.active
    if (data.public !== undefined) mission.public = data.public

    await mission.save()
    await mission.load('launch')
    
    return response.json(mission)
  }

  /**
   * Delete a mission
   */
  async destroy({ params, response }: HttpContext) {
    const { id } = params
    const mission = await Mission.findOrFail(id)
    await mission.delete()
    
    return response.status(204).noContent()
  }
}