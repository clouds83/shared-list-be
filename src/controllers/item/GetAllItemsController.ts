import { Request, Response } from 'express'
import { GetAllItemsService } from '../../services/item/GetAllItemsService'
import prismaClient from '../../prisma'

class GetAllItemsController {
  async handle(req: Request, res: Response) {
    const { user_id } = req

    const { subscriptionId } = await prismaClient.user.findUnique({
      where: {
        id: user_id,
      },
      select: {
        subscriptionId: true,
      },
    })

    const getAllItemsService = new GetAllItemsService()

    const items = await getAllItemsService.execute(subscriptionId)

    return res.json(items)
  }
}

export { GetAllItemsController }
