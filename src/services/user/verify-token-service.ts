import prismaClient from '../../prisma'
import { verify } from 'jsonwebtoken'

interface Payload {
  sub: string
  email: string
}

class VerifyTokenService {
  async execute(token: string) {
    if (!token) {
      throw new Error('Token is required')
    }

    try {
      // Verify JWT signature and decode payload
      const payload = verify(token, process.env.JWT_SECRET) as Payload
      const userId = payload.sub

      // Get user with subscription information
      const user = await prismaClient.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
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

      if (!user) {
        throw new Error('User not found')
      }

      // Determine the user's subscription (either owned or membership)
      const subscriptionId = user.ownedSubscription?.id || user.membershipSubscription?.subscriptionId || null
      const isOwner = !!user.ownedSubscription
      const canEdit = isOwner || (user.membershipSubscription?.canEdit && user.membershipSubscription?.isActive) || false

      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        subscriptionId,
        isOwner,
        canEdit,
      }
    } catch (error) {
      throw new Error('Invalid token')
    }
  }
}

export { VerifyTokenService } 