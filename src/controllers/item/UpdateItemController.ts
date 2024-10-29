import { Request, Response } from 'express'
import { UpdateItemService } from '../../services/item/UpdateItemService'

class UpdateItemController {
  async handle(req: Request, res: Response) {
    const {
      id,
      name,
      shouldBuy,
      quantity,
      unit,
      category,
      price1Name,
      price2Name,
      price3Name,
      price1,
      price2,
      price3,
    } = req.body

    const updateItemService = new UpdateItemService()

    const item = await updateItemService.execute({
      id,
      name,
      shouldBuy,
      quantity,
      unit,
      category,
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

export { UpdateItemController }
