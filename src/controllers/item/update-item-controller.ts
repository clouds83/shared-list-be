import { Request, Response } from 'express'
import { UpdateItemService } from '../../services/item/update-item-service'

class UpdateItemController {
  async handle(req: Request, res: Response) {
    const { id, name, shouldBuy, quantity, unit, category, currentStock, prices } = req.body

    const updateItemService = new UpdateItemService()

    const item = await updateItemService.execute({
      id,
      name,
      shouldBuy,
      quantity,
      unit,
      category,
      currentStock,
      prices,
    })

    return res.json(item)
  }
}

export { UpdateItemController }
