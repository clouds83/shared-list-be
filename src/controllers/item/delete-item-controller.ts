import { Request, Response } from 'express'
import { DeleteItemService } from '../../services/item/delete-item-service'

class DeleteItemController {
  async handle(req: Request, res: Response) {
    const { id } = req.body

    const deleteItemService = new DeleteItemService()

    try {
      const deletedItem = await deleteItemService.execute({ id })
      return res.json(deletedItem)
    } catch (error) {
      return res.status(400).json({ error: error.message })
    }
  }
}

export { DeleteItemController }
