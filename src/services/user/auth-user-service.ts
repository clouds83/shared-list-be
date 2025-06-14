import prismaClient from '../../prisma'
import { compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken'

interface AuthRequest {
  email: string
  password: string
}

const genericErrorMessage = 'Invalid email or password'

class AuthUserService {
  async execute({ email, password }: AuthRequest) {
    if (!email || !password) {
      throw new Error('Email and password are required')
    }

    const user = await prismaClient.user.findUnique({
      where: {
        email,
      },
      include: {
        ownedSubscription: {
          select: {
            id: true,
          },
        },
        membershipSubscription: {
          select: {
            subscriptionId: true,
            canEdit: true,
            isActive: true,
          },
        },
      },
    })
    if (!user) throw new Error(genericErrorMessage)

    const { id, firstName, lastName, password: storedPassword, ownedSubscription, membershipSubscription } = user

    const passwordMatch = await compare(password, storedPassword)
    if (!passwordMatch) throw new Error(genericErrorMessage)

    // Determine the user's subscription (either owned or membership)
    const subscriptionId = ownedSubscription?.id || membershipSubscription?.subscriptionId || null
    const isOwner = !!ownedSubscription
    const canEdit = isOwner || (membershipSubscription?.canEdit && membershipSubscription?.isActive) || false

    const token = sign(
      {
        email,
      },
      process.env.JWT_SECRET,
      {
        subject: id, // user id
        expiresIn: '30d',
      }
    )

    return { 
      id, 
      firstName, 
      lastName, 
      email, 
      subscriptionId, 
      isOwner, 
      canEdit, 
      token 
    }
  }
}

export { AuthUserService }
