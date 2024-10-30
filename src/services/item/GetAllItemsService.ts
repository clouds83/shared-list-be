import prismaClient from '../../prisma'
import { Prisma } from '@prisma/client'

class GetAllItemsService {
  async execute(
    subscriptionId: string,
    page: number,
    itemsPerPage: number,
    sortOrder: 'asc' | 'desc',
    category?: string,
    search?: string
  ) {
    const whereClause: Prisma.ItemWhereInput = {
      subscriptionId,
      ...(category && { category }),
      ...(search && {
        OR: [
          {
            name: {
              contains: search,
            },
          },
          {
            category: {
              contains: search,
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
        orderBy: [{ shouldBuy: 'desc' }, { name: sortOrder }],
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
    }
  }
}

export { GetAllItemsService }
