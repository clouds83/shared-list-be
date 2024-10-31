import prismaClient from '../../prisma'
import { hash } from 'bcryptjs'

interface CreateUserRequest {
  firstName: string
  lastName: string
  rawEmail: string
  password: string
  subscription_owner_id: string
}

class AddSecondaryUserService {
  async execute({ firstName, lastName, rawEmail, password, subscription_owner_id }: CreateUserRequest) {
    if (!rawEmail) throw new Error('Email incorrect')

    const email = rawEmail.trim()

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

    // get the subscription ID of the authenticated user
    const { id: subscriptionId } = await prismaClient.subscription.findFirst({
      where: {
        ownerId: subscription_owner_id,
      },
    })

    // create the user
    const createdUser = await prismaClient.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: passwordHash,
        subscriptionId,
      },
    })

    // return the created user with their subscription and shopping list
    return {
      ...createdUser,
    }
  }
}

export { AddSecondaryUserService }
