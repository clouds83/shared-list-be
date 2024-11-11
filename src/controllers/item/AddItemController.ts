import { Request, Response } from 'express'
import { AddItemService } from '../../services/item/AddItemService'

class AddItemController {
  async handle(req: Request, res: Response) {
    const { name, quantity, unit, category, prices, subscriptionId } = req.body

    const addItemService = new AddItemService()

    const item = await addItemService.execute({
      name,
      quantity,
      unit,
      category,
      prices,
      subscriptionId,
    })

    return res.json(item)
  }
}

export { AddItemController }
