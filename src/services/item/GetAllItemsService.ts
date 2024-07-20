import prismaClient from '../../prisma'

class GetAllItemsService {
  async execute(subscriptionId: string) {
    const items = await prismaClient.item.findMany({
      where: {
        subscriptionId,
      },
    })

    return items
  }
}

export { GetAllItemsService }
