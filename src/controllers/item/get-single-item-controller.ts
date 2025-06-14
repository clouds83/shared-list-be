import { Request, Response } from 'express'
import { GetSingleItemService } from '../../services/item/get-single-item-service'

class GetSingleItemController {
  async handle(req: Request, res: Response) {
    const { user_id: userId } = req
    const { itemId } = req.params

    if (!itemId) {
      return res.status(400).json({ error: 'Item ID is required' })
    }

    try {
      // TODO: Add item access validation here
      // Verify that the user has access to this item via subscription

      const getSingleItemService = new GetSingleItemService()
      const item = await getSingleItemService.execute(itemId)

      return res.json(item)
    } catch (error) {
      return res.status(400).json({ error: error.message })
    }
  }
}

export { GetSingleItemController } 