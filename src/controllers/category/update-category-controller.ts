import { Request, Response } from 'express'
import { updateCategory } from '../../services/categoryService'

interface AuthenticatedRequest extends Request {
  user?: {
    id: string
  }
}

interface UpdateCategoryRequest {
  name: string
  subscriptionId: string
}

export class UpdateCategoryController {
  async handle(request: AuthenticatedRequest, response: Response) {
    try {
      const { categoryId } = request.params
      const { name, subscriptionId }: UpdateCategoryRequest = request.body

      if (!categoryId) {
        return response.status(400).json({
          error: 'Category ID is required'
        })
      }

      if (!name?.trim() || !subscriptionId) {
        return response.status(400).json({
          error: 'Category name and subscription ID are required'
        })
      }

      // TODO: Add subscription edit access validation here
      // const hasEditAccess = await validateEditAccess(request.user?.id, subscriptionId)
      // if (!hasEditAccess) {
      //   return response.status(403).json({ error: 'Edit access denied' })
      // }

      const category = await updateCategory(categoryId, name.trim(), subscriptionId)

      return response.status(200).json({
        success: true,
        category
      })
    } catch (error) {
      console.error('Error updating category:', error)
      
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
        if (error.message === 'Category name already exists' || error.message === 'Category name cannot be empty') {
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