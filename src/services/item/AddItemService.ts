import prismaClient from '../../prisma'

interface AddItemRequest {
  name: string
  quantity: number
  unit: string
  category: string
  price1Name: string
  price2Name: string
  price3Name: string
  price1: number
  price2: number
  price3: number
  subscriptionId: string
}

class AddItemService {
  async execute({
    name,
    quantity,
    unit,
    category,
    price1Name,
    price2Name,
    price3Name,
    price1,
    price2,
    price3,
    subscriptionId,
  }: AddItemRequest) {
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
        price1Name,
        price2Name,
        price3Name,
        price1,
        price2,
        price3,
        subscriptionId,
      },
    })

    return createdItem
  }
}

export { AddItemService }
