import { Request, Response } from 'express'
import { createCategory } from '../../services/categoryService'

interface AuthenticatedRequest extends Request {
  user?: {
    id: string
  }
}

interface CreateCategoryRequest {
  name: string
  subscriptionId: string
}

export class CreateCategoryController {
  async handle(request: AuthenticatedRequest, response: Response) {
    try {
      const { name, subscriptionId }: CreateCategoryRequest = request.body

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

      const category = await createCategory(subscriptionId, name.trim())

      return response.status(201).json({
        success: true,
        category
      })
    } catch (error) {
      console.error('Error creating category:', error)
      
      if (error instanceof Error) {
        if (error.message === 'Category already exists') {
          return response.status(409).json({
            error: error.message
          })
        }
        if (error.message === 'Category name cannot be empty') {
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