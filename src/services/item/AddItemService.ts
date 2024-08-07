import prismaClient from '../../prisma'

interface AddItemRequest {
  name: string
  isBought: boolean
  quantity: number
  unit: string
  category: string
  price1Name: string
  price2Name: string
  price3Name: string
  price1: number
  price2: number
  price3: number
  user_id: string
}

class AddItemService {
  async execute({
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
    user_id,
  }: AddItemRequest) {
    const { subscriptionId } = await prismaClient.user.findFirst({
      where: {
        id: user_id,
      },
    })

    // using the name and subscriptionId, check if there is already an item with the same name
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
        subscriptionId,
      },
    })

    return createdItem
  }
}

export { AddItemService }
