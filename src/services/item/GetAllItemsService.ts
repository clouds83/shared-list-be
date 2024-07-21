import prismaClient from '../../prisma'

class GetAllItemsService {
  async execute(subscriptionId: string, page: number, pageSize: number, category: string, sortOrder: 'asc' | 'desc') {
    const items = await prismaClient.item.findMany({
      where: {
        subscriptionId,
        category,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        name: sortOrder,
      },
    })

    // for pagination UI
    const totalItems = await prismaClient.item.count({
      where: {
        subscriptionId,
        category,
      },
    })

    return {
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      currentPage: page,
    }
  }
}

export { GetAllItemsService }
