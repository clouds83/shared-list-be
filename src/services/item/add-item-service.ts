import prismaClient from '../../prisma'
import { StockLevel } from '@prisma/client'
import { findOrCreateCategory } from '../categoryService'
import { findOrCreateUnit } from '../unitService'

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

      // Find or create category if provided
      let categoryId = null
      if (normalizedCategory) {
        const categoryObj = await findOrCreateCategory(subscriptionId, normalizedCategory)
        categoryId = categoryObj.id
      }

      // Find or create unit if provided
      let unitId = null
      if (normalizedUnit) {
        const unitObj = await findOrCreateUnit(subscriptionId, normalizedUnit)
        unitId = unitObj.id
      }

      // Create the item with foreign key references
      const createdItem = await prisma.item.create({
        data: {
          name: trimmedName,
          subscriptionId,
          quantity: quantity ?? 1,
          categoryId,
          unitId,
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

      // Return the created item with its prices and related data
      return prisma.item.findUnique({
        where: { id: createdItem.id },
        include: {
          prices: {
            orderBy: { createdAt: 'desc' },
          },
          category: true,
          unit: true,
        },
      })
    })

    return itemWithPrice
  }
}

export { AddItemService }
