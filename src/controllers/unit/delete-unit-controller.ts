import { Request, Response } from 'express'
import { deleteUnit } from '../../services/unitService'

interface AuthenticatedRequest extends Request {
  user?: {
    id: string
  }
}

interface DeleteUnitRequest {
  subscriptionId: string
}

export class DeleteUnitController {
  async handle(request: AuthenticatedRequest, response: Response) {
    try {
      const { unitId } = request.params
      const { subscriptionId }: DeleteUnitRequest = request.body

      if (!unitId) {
        return response.status(400).json({
          error: 'Unit ID is required'
        })
      }

      if (!subscriptionId) {
        return response.status(400).json({
          error: 'Subscription ID is required'
        })
      }

      // TODO: Add subscription edit access validation here
      // const hasEditAccess = await validateEditAccess(request.user?.id, subscriptionId)
      // if (!hasEditAccess) {
      //   return response.status(403).json({ error: 'Edit access denied' })
      // }

      const result = await deleteUnit(unitId, subscriptionId)

      return response.status(200).json({
        success: true,
        message: `Unit deleted successfully. ${result.affectedItems} items had their unit removed.`,
        deletedUnit: result.deletedUnit,
        affectedItems: result.affectedItems
      })
    } catch (error) {
      console.error('Error deleting unit:', error)
      
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
      }

      return response.status(500).json({
        error: 'Internal server error'
      })
    }
  }
} 