import { Request, Response } from 'express'
import { AddItemService } from '../../services/item/AddItemService'

class AddItemController {
  async handle(req: Request, res: Response) {
    const {
      name,
      quantity,
      unit,
      category,
      price1Name,
      price2Name,
      price3Name,
      price1,
      price2,
      price3,
      subscriptionId,
    } = req.body

    const addItemService = new AddItemService()

    const item = await addItemService.execute({
      name,
      quantity,
      unit,
      category,
      price1Name,
      price2Name,
      price3Name,
      price1,
      price2,
      price3,
      subscriptionId,
    })

    return res.json(item)
  }
}

export { AddItemController }
