import { Request, Response } from 'express'
import { getCategories } from '../../services/categoryService'

interface AuthenticatedRequest extends Request {
  user?: {
    id: string
  }
}

export class GetCategoriesController {
  async handle(request: AuthenticatedRequest, response: Response) {
    try {
      const { subscriptionId } = request.query

      if (!subscriptionId || typeof subscriptionId !== 'string') {
        return response.status(400).json({
          error: 'Subscription ID is required'
        })
      }

      // TODO: Add subscription access validation here
      // const hasAccess = await validateSubscriptionAccess(request.user?.id, subscriptionId)
      // if (!hasAccess) {
      //   return response.status(403).json({ error: 'Access denied' })
      // }

      const categories = await getCategories(subscriptionId)

      return response.status(200).json({
        success: true,
        categories
      })
    } catch (error) {
      console.error('Error getting categories:', error)
      return response.status(500).json({
        error: 'Internal server error'
      })
    }
  }
} 