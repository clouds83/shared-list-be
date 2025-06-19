import prismaClient from '../../prisma'
import { StockLevel } from '@prisma/client'

interface PriceData {
  price: number
  store?: string
}

interface AddItemRequest {
  name: string
  subscriptionId: string
  quantity?: number // Optional, defaults to 1
  unit?: string // Optional
  category?: string // Optional, defaults to "Uncategorized"
  currentStock?: StockLevel // Optional stock level
  shouldBuy?: boolean // Optional, defaults to true
  prices?: PriceData[]
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
    prices,
  }: AddItemRequest) {
    if (!name?.trim() || !subscriptionId) {
      throw new Error('Item name and subscription ID are required')
    }

    if (prices && prices.length > 3) {
      throw new Error('You can add a maximum of 3 prices at a time.')
    }

    const trimmedName = name.trim()
    // Convert category to lowercase for consistent storage, or null if empty
    const normalizedCategory = category?.trim()
      ? category.trim().toLowerCase()
      : null
    // Convert unit to lowercase for consistent storage, or null if empty
    const normalizedUnit = unit?.trim() ? unit.trim().toLowerCase() : null

    const itemWithPrice = await prismaClient.$transaction(async (prisma) => {
      // Check if item already exists in this subscription
      const existingItem = await prisma.item.findFirst({
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

      // Create the item
      const createdItem = await prisma.item.create({
        data: {
          name: trimmedName,
          subscriptionId,
          quantity: quantity ?? 1,
          unit: normalizedUnit,
          category: normalizedCategory,
          currentStock,
          shouldBuy,
        },
      })

      // Create prices if they were provided
      if (prices && prices.length > 0) {
        await prisma.itemPrice.createMany({
          data: prices.map((p) => ({
            price: p.price,
            store: p.store,
            itemId: createdItem.id,
          })),
        })
      }

      // Update subscription categories if a new category was added
      if (normalizedCategory) {
        const subscription = await prisma.subscription.findUnique({
          where: { id: subscriptionId },
          select: { categories: true },
        })

        if (
          subscription &&
          !subscription.categories.includes(normalizedCategory)
        ) {
          await prisma.subscription.update({
            where: { id: subscriptionId },
            data: {
              categories: [...subscription.categories, normalizedCategory],
            },
          })
        }
      }

      // Return the created item with its prices
      return prisma.item.findUnique({
        where: { id: createdItem.id },
        include: {
          prices: {
            orderBy: { createdAt: 'desc' },
          },
        },
      })
    })

    return itemWithPrice
  }
}

export { AddItemService }
