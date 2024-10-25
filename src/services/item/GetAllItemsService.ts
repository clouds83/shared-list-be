import prismaClient from '../../prisma'
import { Prisma } from '@prisma/client'

class GetAllItemsService {
  async execute(
    subscriptionId: string,
    page: number = 1,
    pageSize: number = 5,
    category?: string,
    sortOrder: 'asc' | 'desc' = 'asc',
    search?: string
  ) {
    const whereClause: Prisma.ItemWhereInput = {
      subscriptionId,
      ...(category && { category }),
      ...(search && {
        name: {
          contains: search,
        },
      }),
    }

    const [items, totalItems] = await Promise.all([
      prismaClient.item.findMany({
        where: whereClause,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          name: sortOrder,
        },
      }),
      prismaClient.item.count({
        where: whereClause,
      }),
    ])

    return {
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      currentPage: page,
    }
  }
}

export { GetAllItemsService }
