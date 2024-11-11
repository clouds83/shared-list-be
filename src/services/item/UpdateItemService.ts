import { InputJsonValue } from '@prisma/client/runtime/library'
import prismaClient from '../../prisma'

interface UpdateItemRequest {
  id: string
  name?: string
  shouldBuy?: boolean
  quantity?: number
  unit?: string
  category?: string
  prices?: InputJsonValue
}

class UpdateItemService {
  async execute({ id, name, shouldBuy, quantity, unit, category, prices }: UpdateItemRequest) {
    if (!id) {
      throw new Error('Item ID is required')
    }

    const hasAtLeastOneField =
      name !== undefined ||
      shouldBuy !== undefined ||
      quantity !== undefined ||
      unit !== undefined ||
      category !== undefined ||
      prices !== undefined

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
          prices,
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
