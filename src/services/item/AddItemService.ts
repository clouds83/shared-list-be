import { InputJsonValue } from '@prisma/client/runtime/library'
import prismaClient from '../../prisma'

interface AddItemRequest {
  name: string
  quantity: number
  unit: string
  category: string
  prices: InputJsonValue
  subscriptionId: string
}

class AddItemService {
  async execute({ name, quantity, unit, category, prices, subscriptionId }: AddItemRequest) {
    if (!name || !subscriptionId) {
      throw new Error('Missing required information')
    }

    const itemAlreadyExists = await prismaClient.item.findFirst({
      where: {
        name,
        subscriptionId,
      },
    })

    if (itemAlreadyExists) {
      throw new Error('Item already exists')
    }

    const createdItem = await prismaClient.item.create({
      data: {
        name,
        quantity,
        unit,
        category,
        prices,
        subscriptionId,
      },
    })

    return createdItem
  }
}

export { AddItemService }
