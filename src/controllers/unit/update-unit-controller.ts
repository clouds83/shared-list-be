import { Request, Response } from 'express'
import { updateUnit } from '../../services/unitService'

interface AuthenticatedRequest extends Request {
  user?: {
    id: string
  }
}

interface UpdateUnitRequest {
  name: string
  subscriptionId: string
}

export class UpdateUnitController {
  async handle(request: AuthenticatedRequest, response: Response) {
    try {
      const { unitId } = request.params
      const { name, subscriptionId }: UpdateUnitRequest = request.body

      if (!unitId) {
        return response.status(400).json({
          error: 'Unit ID is required'
        })
      }

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

      const unit = await updateUnit(unitId, name.trim(), subscriptionId)

      return response.status(200).json({
        success: true,
        unit
      })
    } catch (error) {
      console.error('Error updating unit:', error)
      
      if (error instanceof Error) {
        if (error.message === 'Unit not found') {
          return response.status(404).json({
            error: error.message
          })
        }
        if (error.message === 'Unit does not belong to this subscription') {
          return response.status(403).json({
            error: error.message
          })
        }
        if (error.message === 'Unit name already exists' || error.message === 'Unit name cannot be empty') {
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