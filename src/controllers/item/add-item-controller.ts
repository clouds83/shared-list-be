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
      initialPrice 
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
        error: 'Invalid stock level. Must be LOW, MEDIUM, or HIGH' 
      })
    }

    // Validate initial price if provided
    if (initialPrice && (typeof initialPrice.price !== 'number' || initialPrice.price < 0)) {
      return res.status(400).json({ 
        error: 'Initial price must be a non-negative number' 
      })
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
        initialPrice,
      })

      return res.status(201).json(item)
    } catch (error) {
      return res.status(400).json({ error: error.message })
    }
  }
}

export { AddItemController } 