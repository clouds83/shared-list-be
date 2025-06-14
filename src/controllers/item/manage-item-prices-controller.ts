import { Request, Response } from 'express'
import { ManageItemPricesService } from '../../services/item/manage-item-prices-service'

class ManageItemPricesController {
  // Add a new price for an item
  async addPrice(req: Request, res: Response) {
    const { user_id: userId } = req
    const { itemId, price, store } = req.body

    if (!itemId) {
      return res.status(400).json({ error: 'Item ID is required' })
    }

    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ error: 'Valid price (>= 0) is required' })
    }

    try {
      // TODO: Add item access validation here
      // Verify that the user has access to this item via subscription

      const priceService = new ManageItemPricesService()
      const newPrice = await priceService.addPrice({ itemId, price, store })

      return res.status(201).json(newPrice)
    } catch (error) {
      return res.status(400).json({ error: error.message })
    }
  }

  // Update an existing price
  async updatePrice(req: Request, res: Response) {
    const { user_id: userId } = req
    const { priceId } = req.params
    const { price, store } = req.body

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' })
    }

    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      return res.status(400).json({ error: 'Price must be a non-negative number' })
    }

    if (price === undefined && store === undefined) {
      return res.status(400).json({ 
        error: 'At least one field (price or store) must be provided' 
      })
    }

    try {
      // TODO: Add price access validation here
      // Verify that the user has access to this price record via item subscription

      const priceService = new ManageItemPricesService()
      const updatedPrice = await priceService.updatePrice({ priceId, price, store })

      return res.json(updatedPrice)
    } catch (error) {
      return res.status(400).json({ error: error.message })
    }
  }

  // Delete a price record
  async deletePrice(req: Request, res: Response) {
    const { user_id: userId } = req
    const { priceId } = req.params

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' })
    }

    try {
      // TODO: Add price access validation here
      // Verify that the user has access to this price record via item subscription

      const priceService = new ManageItemPricesService()
      const deletedPrice = await priceService.deletePrice(priceId)

      return res.json({ message: 'Price deleted successfully', deletedPrice })
    } catch (error) {
      return res.status(400).json({ error: error.message })
    }
  }
}

export { ManageItemPricesController } 