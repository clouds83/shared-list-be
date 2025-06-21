import { Request, Response } from 'express'
import { createUnit } from '../../services/unitService'

interface AuthenticatedRequest extends Request {
  user?: {
    id: string
  }
}

interface CreateUnitRequest {
  name: string
  subscriptionId: string
}

export class CreateUnitController {
  async handle(request: AuthenticatedRequest, response: Response) {
    try {
      const { name, subscriptionId }: CreateUnitRequest = request.body

      if (!name?.trim() || !subscriptionId) {
        return response.status(400).json({
          error: 'Unit name and subscription ID are required'
        })
      }

      // TODO: Add subscription edit access validation here
      // const hasEditAccess = await validateEditAccess(request.user?.id, subscriptionId)
      // if (!hasEditAccess) {
      //   return response.status(403).json({ error: 'Edit access denied' })
      // }

      const unit = await createUnit(subscriptionId, name.trim())

      return response.status(201).json({
        success: true,
        unit
      })
    } catch (error) {
      console.error('Error creating unit:', error)
      
      if (error instanceof Error) {
        if (error.message === 'Unit already exists') {
          return response.status(409).json({
            error: error.message
          })
        }
        if (error.message === 'Unit name cannot be empty') {
          return response.status(400).json({
            error: error.message
          })
        }
      }

      return response.status(500).json({
        error: 'Internal server error'
      })
    }
  }
} 