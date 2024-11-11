import { Request, Response } from 'express'
import { UpdateItemService } from '../../services/item/UpdateItemService'

class UpdateItemController {
  async handle(req: Request, res: Response) {
    const { id, name, shouldBuy, quantity, unit, category, prices } = req.body

    const updateItemService = new UpdateItemService()

    const item = await updateItemService.execute({
      id,
      name,
      shouldBuy,
      quantity,
      unit,
      category,
      prices,
    })

    return res.json(item)
  }
}

export { UpdateItemController }
