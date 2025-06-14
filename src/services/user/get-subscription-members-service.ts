import prismaClient from '../../prisma'

class GetSubscriptionMembersService {
  // Get all members of a subscription (for owner to manage)
  async execute(ownerId: string) {
    // First verify that the requester is the owner of the subscription
    const ownerSubscription = await prismaClient.subscription.findFirst({
      where: {
        ownerId,
      },
    })

    if (!ownerSubscription) {
      throw new Error('Only the subscription owner can view members')
    }

    // Get all members of the subscription
    const members = await prismaClient.subscriptionMember.findMany({
      where: {
        subscriptionId: ownerSubscription.id,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    })

    return members
  }
}

export { GetSubscriptionMembersService } 