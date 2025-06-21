import prismaClient from '../../prisma'
import { Prisma, StockLevel } from '@prisma/client'

interface GetItemsFilters {
  category?: string
  search?: string
  shouldBuy?: boolean
  stockLevel?: StockLevel
}

interface GetItemsOptions {
  page: number
  itemsPerPage: number
  sortOrder: 'asc' | 'desc'
  sortBy?: 'name' | 'createdAt' | 'updatedAt'
}

class GetAllItemsService {
  async execute(
    subscriptionId: string,
    options: GetItemsOptions,
    filters: GetItemsFilters = {}
  ) {
    const { page, itemsPerPage, sortOrder, sortBy = 'name' } = options
    const { category, search, shouldBuy, stockLevel } = filters

    const whereClause: Prisma.ItemWhereInput = {
      subscriptionId,
      ...(category && category !== 'all' && { 
        category: {
          name: {
            equals: category.toLowerCase(),
            mode: 'insensitive'
          }
        }
      }),
      ...(shouldBuy !== undefined && { shouldBuy }),
      ...(stockLevel && { currentStock: stockLevel }),
      ...(search && {
        OR: [
          {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            category: {
              name: {
                contains: search,
                mode: 'insensitive',
              }
            }
          },
        ],
      }),
    }

    // Create custom ordering for stock levels: LOW -> MEDIUM -> HIGH
    const stockOrderMap = { LOW: 1, MEDIUM: 2, HIGH: 3 }

    const [items, totalItems] = await Promise.all([
      prismaClient.item.findMany({
        where: whereClause,
        skip: (page - 1) * itemsPerPage,
        take: itemsPerPage,
        include: {
          prices: {
            orderBy: [
              { price: 'asc' },        // Cheapest price first
              { createdAt: 'desc' },   // Most recent if tied
            ],
          },
          category: true,
          unit: true,
        },
      }),
      prismaClient.item.count({
        where: whereClause,
      }),
    ])

    // Apply custom sorting: shouldBuy first, then stock level (LOW->MEDIUM->HIGH), then by sortBy
    const sortedItems = items.sort((a, b) => {
      // First priority: shouldBuy (true first)
      if (a.shouldBuy !== b.shouldBuy) {
        return b.shouldBuy ? 1 : -1
      }

      // Second priority: stock level (LOW -> MEDIUM -> HIGH)
      if (a.currentStock && b.currentStock) {
        const aStockOrder = stockOrderMap[a.currentStock] || 999
        const bStockOrder = stockOrderMap[b.currentStock] || 999
        if (aStockOrder !== bStockOrder) {
          return aStockOrder - bStockOrder
        }
      } else if (a.currentStock && !b.currentStock) {
        return -1 // Items with stock come first
      } else if (!a.currentStock && b.currentStock) {
        return 1 // Items with stock come first
      }

      // Third priority: user-specified sorting
      if (sortBy === 'name') {
        const comparison = a.name.localeCompare(b.name)
        return sortOrder === 'asc' ? comparison : -comparison
      } else if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        const aDate = new Date(a[sortBy]).getTime()
        const bDate = new Date(b[sortBy]).getTime()
        const comparison = aDate - bDate
        return sortOrder === 'asc' ? comparison : -comparison
      }

      return 0
    })

    return {
      items: sortedItems,
      totalItems,
      totalPages: Math.ceil(totalItems / itemsPerPage),
      currentPage: page,
      filters: filters,
    }
  }
}

export { GetAllItemsService }
