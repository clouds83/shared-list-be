import { Request, Response } from 'express'
import { GetAllItemsService } from '../../services/item/get-all-items-service'

class GetAllItemsController {
  async handle(req: Request, res: Response) {
    const { user_id: userId } = req
    const {
      subscriptionId,
      page = '1',
      itemsPerPage = '10',
      sortOrder = 'asc',
      sortBy = 'name',
      category,
      search,
      shouldBuy,
      stockLevel,
    } = req.query

    // Validate required parameters
    if (!subscriptionId) {
      return res.status(400).json({ error: 'Subscription ID is required' })
    }

    // Validate pagination parameters
    const pageNum = parseInt(page as string)
    const itemsPerPageNum = parseInt(itemsPerPage as string)

    if (pageNum < 1 || itemsPerPageNum < 1 || itemsPerPageNum > 100) {
      return res.status(400).json({ 
        error: 'Invalid pagination parameters. Page must be >= 1, itemsPerPage must be 1-100' 
      })
    }

    // Validate sort parameters
    if (!['asc', 'desc'].includes(sortOrder as string)) {
      return res.status(400).json({ error: 'Sort order must be "asc" or "desc"' })
    }

    if (!['name', 'createdAt', 'updatedAt'].includes(sortBy as string)) {
      return res.status(400).json({ error: 'Sort by must be "name", "createdAt", or "updatedAt"' })
    }

    // Validate stock level if provided
    if (stockLevel && !['LOW', 'MEDIUM', 'HIGH'].includes(stockLevel as string)) {
      return res.status(400).json({ 
        error: 'Invalid stock level. Must be LOW, MEDIUM, or HIGH' 
      })
    }

    try {
      // TODO: Add subscription access validation here
      // Verify that the user has access to this subscription

      const getAllItemsService = new GetAllItemsService()
      const result = await getAllItemsService.execute(
        subscriptionId as string,
        {
          page: pageNum,
          itemsPerPage: itemsPerPageNum,
          sortOrder: sortOrder as 'asc' | 'desc',
          sortBy: sortBy as 'name' | 'createdAt' | 'updatedAt',
        },
        {
          category: category as string,
          search: search as string,
          shouldBuy: shouldBuy === 'true' ? true : shouldBuy === 'false' ? false : undefined,
          stockLevel: stockLevel as 'LOW' | 'MEDIUM' | 'HIGH' | undefined,
        }
      )

             return res.json(result)
     } catch (error) {
       return res.status(400).json({ error: error.message })
     }
   }
}

export { GetAllItemsController }
