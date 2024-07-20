import prismaClient from '../../prisma'

class GetAllItemsService {
  async execute(shoppingListId: string) {
    const items = await prismaClient.item.findMany({
      where: {
        shoppingListId,
      },
    })

    return items
  }
}

export { GetAllItemsService }
