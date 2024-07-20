import prismaClient from '../../prisma'

interface UpdateItemRequest {
  id: string
  name?: string
  isBought?: boolean
  quantity?: number
  unit?: string
  category?: string
  price1Name?: string
  price2Name?: string
  price3Name?: string
  price1?: number
  price2?: number
  price3?: number
}

class UpdateItemService {
  async execute({
    id,
    name,
    isBought,
    quantity,
    unit,
    category,
    price1Name,
    price2Name,
    price3Name,
    price1,
    price2,
    price3,
  }: UpdateItemRequest) {
    if (!id) {
      throw new Error('Item ID is required')
    }

    if (
      !name &&
      !isBought &&
      !quantity &&
      !unit &&
      !category &&
      !price1Name &&
      !price2Name &&
      !price3Name &&
      !price1 &&
      !price2 &&
      !price3
    ) {
      throw new Error('At least one field must be informed to update the item')
    }

    try {
      const updatedItem = await prismaClient.item.update({
        where: { id },
        data: {
          name,
          isBought,
          quantity,
          unit,
          category,
          price1Name,
          price2Name,
          price3Name,
          price1,
          price2,
          price3,
        },
      })

      return updatedItem
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Item not found')
      }
      throw new Error('An error occurred while updating the item')
    }
  }
}

export { UpdateItemService }
