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
      ...(category && category !== 'all' && { category }),
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
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      }),
    }

    const [items, totalItems] = await Promise.all([
      prismaClient.item.findMany({
        where: whereClause,
        skip: (page - 1) * itemsPerPage,
        take: itemsPerPage,
        orderBy: [
          { shouldBuy: 'desc' }, // Always show items to buy first
          { [sortBy]: sortOrder },
        ],
        include: {
          prices: {
            orderBy: [
              { price: 'asc' },        // Cheapest price first
              { createdAt: 'desc' },   // Most recent if tied
            ],
            take: 1, // Get only the cheapest price
          },
        },
      }),
      prismaClient.item.count({
        where: whereClause,
      }),
    ])

    return {
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / itemsPerPage),
      currentPage: page,
      filters: filters,
    }
  }
}

export { GetAllItemsService }
