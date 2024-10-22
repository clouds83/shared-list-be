import prismaClient from '../../prisma'

class DeleteItemService {
  async execute({ id }: { id: string }) {
    if (!id) {
      throw new Error('Item ID is required')
    }

    try {
      const deletedItem = await prismaClient.item.delete({
        where: { id },
      })

      return deletedItem
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Item not found')
      }
      throw new Error('An error occurred while deleting the item')
    }
  }
}

export { DeleteItemService }
