import prismaClient from '../../prisma'

interface UpdateItemRequest {
  id: string
  name?: string
  shouldBuy?: boolean
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
    shouldBuy,
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

    const hasAtLeastOneField =
      name !== undefined ||
      shouldBuy !== undefined ||
      quantity !== undefined ||
      unit !== undefined ||
      category !== undefined ||
      price1Name !== undefined ||
      price2Name !== undefined ||
      price3Name !== undefined ||
      price1 !== undefined ||
      price2 !== undefined ||
      price3 !== undefined

    if (!hasAtLeastOneField) {
      throw new Error('At least one field must be informed to update the item')
    }

    try {
      const updatedItem = await prismaClient.item.update({
        where: { id },
        data: {
          name,
          shouldBuy,
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
