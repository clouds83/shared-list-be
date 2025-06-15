import prismaClient from '../../prisma'
import { hash } from 'bcryptjs'
import { sign } from 'jsonwebtoken'

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

    // Generate JWT token
    const token = sign(
      {
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        subject: user.id, // user id
        expiresIn: '30d',
      }
    )

    // return user data with subscription info and token
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      subscriptionId: subscription.id,
      isOwner: true,
      canEdit: true,
      token
    }
  }
}

export { CreateOwnerService }
