import { Request, Response } from 'express'
import { GetAllItemsService } from '../../services/item/GetAllItemsService'
import prismaClient from '../../prisma'

class GetAllItemsController {
  async handle(req: Request, res: Response) {
    const { subscriptionId } = req.body
    // page and itemsPerPage from query parameters
    const page = parseInt(req.query.page as string) || 1
    const itemsPerPage = parseInt(req.query.itemsPerPage as string) || 10
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc'
    const category = req.query.category as string
    const search = req.query.search as string

    const getAllItemsService = new GetAllItemsService()

    const items = await getAllItemsService.execute(subscriptionId, page, itemsPerPage, sortOrder, category, search)

    return res.json(items)
  }
}

export { GetAllItemsController }
