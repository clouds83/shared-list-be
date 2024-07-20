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

    const { id: shoppingListId } = await prismaClient.shoppingList.findUnique({
      where: {
        subscriptionId,
      },
      select: {
        id: true,
      },
    })

    const getAllItemsService = new GetAllItemsService()

    const items = await getAllItemsService.execute(shoppingListId)

    return res.json(items)
  }
}

export { GetAllItemsController }
