import { Request, Response } from 'express'
import { AddItemService } from '../../services/item/add-item-service'

class AddItemController {
  async handle(req: Request, res: Response) {
    const { user_id: userId } = req
    const {
      name,
      subscriptionId,
      quantity,
      unit,
      category,
      currentStock,
      shouldBuy,
      prices, // Expecting an array of prices
    } = req.body

    // Validate required fields
    if (!name?.trim()) {
      return res.status(400).json({ error: 'Item name is required' })
    }

    if (!subscriptionId) {
      return res.status(400).json({ error: 'Subscription ID is required' })
    }

    // Validate stock level if provided
    if (currentStock && !['LOW', 'MEDIUM', 'HIGH'].includes(currentStock)) {
      return res.status(400).json({
        error: 'Invalid stock level. Must be LOW, MEDIUM, or HIGH',
      })
    }

    // Validate prices if provided
    if (prices) {
      if (!Array.isArray(prices)) {
        return res.status(400).json({ error: 'Prices must be an array.' })
      }
      if (prices.length > 3) {
        return res
          .status(400)
          .json({ error: 'You can add a maximum of 3 prices.' })
      }
      for (const price of prices) {
        if (typeof price.price !== 'number' || price.price <= 0) {
          return res
            .status(400)
            .json({ error: 'Each price must have a valid positive number.' })
        }
      }
    }

    try {
      // TODO: Add subscription access validation here
      // Verify that the user has access to this subscription

      const addItemService = new AddItemService()
      const item = await addItemService.execute({
        name,
        subscriptionId,
        quantity,
        unit,
        category,
        currentStock,
        shouldBuy,
        prices,
      })

      return res.status(201).json(item)
    } catch (error) {
      return res.status(400).json({ error: error.message })
    }
  }
}

export { AddItemController }
