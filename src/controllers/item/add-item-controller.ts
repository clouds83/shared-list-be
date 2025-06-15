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
      shouldBuy 
    } = req.body

    console.log('Received request body:', req.body)
    console.log('Current stock value:', currentStock, 'Type:', typeof currentStock)
    console.log('Should buy value:', shouldBuy, 'Type:', typeof shouldBuy)

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

    // Prices can be added separately after item creation

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
      })

      return res.status(201).json(item)
    } catch (error) {
      return res.status(400).json({ error: error.message })
    }
  }
}

export { AddItemController } 