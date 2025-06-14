import prismaClient from '../../prisma'
import { hash } from 'bcryptjs'

interface CreateUserRequest {
  firstName: string
  lastName: string
  rawEmail: string
  password: string
  subscription_owner_id: string
}

class CreateMemberService {
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

    // get the subscription ID of the authenticated user (owner)
    const ownerSubscription = await prismaClient.subscription.findFirst({
      where: {
        ownerId: subscription_owner_id,
      },
    })

    if (!ownerSubscription) {
      throw new Error('Subscription not found')
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

    // create the membership relationship
    const membership = await prismaClient.subscriptionMember.create({
      data: {
        userId: createdUser.id,
        subscriptionId: ownerSubscription.id,
        canEdit: false, // Default to no edit permissions
      },
    })

    // return the created user with their membership info
    const userWithMembership = await prismaClient.user.findUnique({
      where: {
        id: createdUser.id,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        membershipSubscription: {
          select: {
            id: true,
            subscriptionId: true,
            joinedAt: true,
            canEdit: true,
            isActive: true,
          },
        },
      },
    })

    return userWithMembership
  }
}

export { CreateMemberService }
