import { Request, Response } from 'express'
import { AddItemService } from '../../services/item/AddItemService'

class AddItemController {
  async handle(req: Request, res: Response) {
    const { user_id } = req
    const { name, isBought, quantity, unit, category, price1Name, price2Name, price3Name, price1, price2, price3 } =
      req.body

    const addItemService = new AddItemService()

    const item = await addItemService.execute({
      name,
      isBought,
      quantity,
      unit,
      category,
      user_id,
      price1Name,
      price2Name,
      price3Name,
      price1,
      price2,
      price3,
    })

    return res.json(item)
  }
}

export { AddItemController }
