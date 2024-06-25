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

    // Check if user already exists
    const userAlreadyExists = await prismaClient.user.findFirst({
      where: {
        email,
      },
    })

    if (userAlreadyExists) {
      throw new Error('User already exists')
    }

    // Hash the password
    const passwordHash = await hash(password, 8)

    // Create the user
    const createdUser = await prismaClient.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: passwordHash,
      },
    })

    // Create a subscription for the user
    const createdSubscription = await prismaClient.subscription.create({
      data: {
        ownerId: createdUser.id,
      },
    })

    // Create a shopping list for the subscription
    const createdShoppingList = await prismaClient.shoppingList.create({
      data: {
        subscriptionId: createdSubscription.id,
      },
    })

    // Return the created user with their subscription and shopping list
    return {
      ...createdUser,
      subscription: createdSubscription,
      shoppingList: createdShoppingList,
    }
  }
}

export { CreateUserService }
