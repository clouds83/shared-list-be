import prismaClient from '../../prisma'
import { hash } from 'bcryptjs'

interface CreateUserRequest {
  firstName: string
  lastName: string
  rawEmail: string
  password: string
}

class CreateUserService {
  async execute({ firstName, lastName, rawEmail, password }: CreateUserRequest) {
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

    // create the user
    const user = await prismaClient.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: passwordHash,
      },
    })

    // create a subscription for the user
    const subscription = await prismaClient.subscription.create({
      data: {
        ownerId: user.id,
      },
    })

    // add subscription ID
    const updatedUser = await prismaClient.user.update({
      where: {
        id: user.id,
      },
      data: {
        subscriptionId: subscription.id,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        subscriptionId: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return updatedUser
  }
}

export { CreateUserService }
