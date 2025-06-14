import prismaClient from '../../prisma'
import { hash } from 'bcryptjs'

interface CreateOwnerRequest {
  firstName: string
  lastName: string
  rawEmail: string
  password: string
}

class CreateOwnerService {
  async execute({ firstName, lastName, rawEmail, password }: CreateOwnerRequest) {
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

    // return user data with subscription info
    const userWithSubscription = await prismaClient.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        ownedSubscription: {
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
    })

    return userWithSubscription
  }
}

export { CreateOwnerService }
