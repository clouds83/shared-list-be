import prismaClient from '../../prisma'
import { StockLevel } from '@prisma/client'

interface AddItemRequest {
  name: string
  subscriptionId: string
  quantity?: number // Optional, defaults to 1
  unit?: string // Optional
  category?: string // Optional, defaults to "Uncategorized"
  currentStock?: StockLevel // Optional stock level
  shouldBuy?: boolean // Optional, defaults to true
  initialPrice?: {
    price: number
    store?: string
  }
}

class AddItemService {
  async execute({ 
    name, 
    subscriptionId, 
    quantity, 
    unit, 
    category, 
    currentStock, 
    shouldBuy = true,
    initialPrice 
  }: AddItemRequest) {
    if (!name?.trim() || !subscriptionId) {
      throw new Error('Item name and subscription ID are required')
    }

    const trimmedName = name.trim()

    // Check if item already exists in this subscription
    const existingItem = await prismaClient.item.findFirst({
      where: {
        name: {
          equals: trimmedName,
          mode: 'insensitive',
        },
        subscriptionId,
      },
    })

    if (existingItem) {
      throw new Error('Item already exists in this subscription')
    }

    // Create the item with proper defaults
    const createdItem = await prismaClient.item.create({
      data: {
        name: trimmedName,
        subscriptionId,
        quantity: quantity ?? 1,
        unit,
        category: category || 'Uncategorized',
        currentStock,
        shouldBuy,
      },
    })

    // Create initial price if provided
    if (initialPrice && initialPrice.price > 0) {
      await prismaClient.itemPrice.create({
        data: {
          itemId: createdItem.id,
          price: initialPrice.price,
          store: initialPrice.store,
        },
      })
    }

    // Update subscription categories if a new category was added
    if (category && category !== 'Uncategorized') {
      const subscription = await prismaClient.subscription.findUnique({
        where: { id: subscriptionId },
        select: { categories: true },
      })

      if (subscription && !subscription.categories.includes(category)) {
        await prismaClient.subscription.update({
          where: { id: subscriptionId },
          data: {
            categories: [...subscription.categories, category],
          },
        })
      }
    }

    // Return the created item with initial price if it exists
    const itemWithPrice = await prismaClient.item.findUnique({
      where: { id: createdItem.id },
      include: {
        prices: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    return itemWithPrice
  }
}

export { AddItemService } 