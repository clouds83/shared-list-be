import prismaClient from '../../prisma'
import { StockLevel } from '@prisma/client'

interface PriceData {
  price: number
  store?: string
}

interface UpdateItemRequest {
  id: string
  name?: string
  shouldBuy?: boolean
  quantity?: number
  unit?: string
  category?: string
  currentStock?: StockLevel
  prices?: PriceData[]
}

class UpdateItemService {
  async execute({
    id,
    name,
    shouldBuy,
    quantity,
    unit,
    category,
    currentStock,
    prices,
  }: UpdateItemRequest) {
    if (!id) {
      throw new Error('Item ID is required')
    }

    // Convert category to lowercase for consistent storage, or null if empty
    const normalizedCategory = category?.trim()
      ? category.trim().toLowerCase()
      : null
    // Convert unit to lowercase for consistent storage, or null if empty
    const normalizedUnit = unit?.trim() ? unit.trim().toLowerCase() : null

    // Even with prices, we might be updating other fields, so this check is tricky.
    // If prices are part of the update, we can consider it a valid update.
    const hasAtLeastOneField =
      name !== undefined ||
      shouldBuy !== undefined ||
      quantity !== undefined ||
      unit !== undefined ||
      category !== undefined ||
      currentStock !== undefined ||
      prices !== undefined

    if (!hasAtLeastOneField) {
      throw new Error('At least one field must be informed to update the item')
    }

    if (prices && prices.length > 3) {
      throw new Error('You can have a maximum of 3 prices.')
    }

    try {
      const updatedItemWithPrices = await prismaClient.$transaction(
        async (prisma) => {
          // 1. Update the item's scalar fields
          const updatedItem = await prisma.item.update({
            where: { id },
            data: {
              name,
              shouldBuy,
              quantity,
              unit: normalizedUnit,
              category: normalizedCategory,
              currentStock,
            },
          })

          // 2. If prices are provided, replace the existing prices
          if (prices) {
            // Delete old prices
            await prisma.itemPrice.deleteMany({
              where: { itemId: id },
            })

            // Create new prices
            if (prices.length > 0) {
              await prisma.itemPrice.createMany({
                data: prices.map((p) => ({
                  itemId: id,
                  price: p.price,
                  store: p.store,
                })),
              })
            }
          }

          // 3. Update subscription categories and units if new ones were added
          if (normalizedCategory || normalizedUnit) {
            // Get the item's subscription ID once
            const item = await prisma.item.findUnique({
              where: { id },
              select: { subscriptionId: true },
            })

            if (item) {
              const subscription = await prisma.subscription.findUnique({
                where: { id: item.subscriptionId },
                select: { categories: true, units: true },
              })

              if (subscription) {
                const updates: { categories?: string[]; units?: string[] } = {}

                // Add new category if provided and not already exists
                if (
                  normalizedCategory &&
                  !subscription.categories.includes(normalizedCategory)
                ) {
                  updates.categories = [
                    ...subscription.categories,
                    normalizedCategory,
                  ]
                }

                // Add new unit if provided and not already exists
                if (
                  normalizedUnit &&
                  !subscription.units.includes(normalizedUnit)
                ) {
                  updates.units = [...subscription.units, normalizedUnit]
                }

                // Update subscription only if there are changes
                if (Object.keys(updates).length > 0) {
                  await prisma.subscription.update({
                    where: { id: item.subscriptionId },
                    data: updates,
                  })
                }
              }
            }
          }

          // 4. Return the updated item with its prices
          return prisma.item.findUnique({
            where: { id },
            include: {
              prices: true,
            },
          })
        }
      )

      return updatedItemWithPrices
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Item not found')
      }
      console.error('Failed to update item:', error)
      throw new Error('An error occurred while updating the item')
    }
  }
}

export { UpdateItemService }
