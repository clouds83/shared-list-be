import { Request, Response } from 'express'
import { GetAllItemsService } from '../../services/item/GetAllItemsService'
import prismaClient from '../../prisma'

class GetAllItemsController {
  async handle(req: Request, res: Response) {
    const { user_id } = req
    // page and pageSize from query parameters
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 10
    const category = req.query.category as string
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc'

    const { subscriptionId } = await prismaClient.user.findUnique({
      where: {
        id: user_id,
      },
      select: {
        subscriptionId: true,
      },
    })

    const getAllItemsService = new GetAllItemsService()

    const items = await getAllItemsService.execute(subscriptionId, page, pageSize, category, sortOrder)

    return res.json(items)
  }
}

export { GetAllItemsController }
