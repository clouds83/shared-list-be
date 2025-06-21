import { Request, Response } from 'express'
import { deleteCategory } from '../../services/categoryService'

interface AuthenticatedRequest extends Request {
  user?: {
    id: string
  }
}

interface DeleteCategoryRequest {
  subscriptionId: string
}

export class DeleteCategoryController {
  async handle(request: AuthenticatedRequest, response: Response) {
    try {
      const { categoryId } = request.params
      const { subscriptionId }: DeleteCategoryRequest = request.body

      if (!categoryId) {
        return response.status(400).json({
          error: 'Category ID is required'
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

      const result = await deleteCategory(categoryId, subscriptionId)

      return response.status(200).json({
        success: true,
        message: `Category deleted successfully. ${result.affectedItems} items had their category removed.`,
        deletedCategory: result.deletedCategory,
        affectedItems: result.affectedItems
      })
    } catch (error) {
      console.error('Error deleting category:', error)
      
      if (error instanceof Error) {
        if (error.message === 'Category not found') {
          return response.status(404).json({
            error: error.message
          })
        }
        if (error.message === 'Category does not belong to this subscription') {
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