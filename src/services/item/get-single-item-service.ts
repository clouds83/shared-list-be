import prismaClient from '../../prisma'

class GetSingleItemService {
  async execute(itemId: string) {
    if (!itemId) {
      throw new Error('Item ID is required')
    }

    const item = await prismaClient.item.findUnique({
      where: { id: itemId },
      include: {
        prices: {
          orderBy: [
            { price: 'asc' },        // Cheapest first
            { createdAt: 'desc' },   // Most recent if tied
          ],
        },
        subscription: {
          select: {
            id: true,
            currencySymbol: true,
          },
        },
      },
    })

    if (!item) {
      throw new Error('Item not found')
    }

    return item
  }
}

export { GetSingleItemService } 