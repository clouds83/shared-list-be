import { Request, Response } from 'express'
import { GetAllItemsService } from '../../services/item/GetAllItemsService'
import prismaClient from '../../prisma'

class GetAllItemsController {
  async handle(req: Request, res: Response) {
    const { subscriptionId } = req.body
    // page and pageSize from query parameters
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 5
    const category = req.query.category as string
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc'
    const search = req.query.search as string

    const getAllItemsService = new GetAllItemsService()

    const items = await getAllItemsService.execute(subscriptionId, page, pageSize, category, sortOrder, search)

    return res.json(items)
  }
}

export { GetAllItemsController }
