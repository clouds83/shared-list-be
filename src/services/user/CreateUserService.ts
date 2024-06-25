import prismaClient from '../../prisma'
import { hash } from 'bcryptjs'

interface CreateUserRequest {
  firstName: string
  lastName: string
  email: string
  password: string
}

class CreateUserService {
  async execute({ firstName, lastName, email, password }: CreateUserRequest) {
    if (!email) throw new Error('Email incorrect')

    // check if user already exists
    const userAlreadyExists = await prismaClient.user.findFirst({
      where: {
        email,
      },
    })

    if (userAlreadyExists) {
      throw new Error('User already exists')
    }

    // hash the password
    const passwordHash = await hash(password, 8)

    // create the user
    const createdUser = await prismaClient.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: passwordHash,
      },
    })

    // create a subscription for the user
    const createdSubscription = await prismaClient.subscription.create({
      data: {
        ownerId: createdUser.id,
      },
    })

    // update the user with the subscription ID
    await prismaClient.user.update({
      where: {
        id: createdUser.id,
      },
      data: {
        subscriptionId: createdSubscription.id,
      },
    })

    // create a shopping list for the subscription
    const createdShoppingList = await prismaClient.shoppingList.create({
      data: {
        subscriptionId: createdSubscription.id,
      },
    })

    // return the created user with their subscription and shopping list
    return {
      ...createdUser,
      subscription: createdSubscription,
      shoppingList: createdShoppingList,
    }
  }
}

export { CreateUserService }
