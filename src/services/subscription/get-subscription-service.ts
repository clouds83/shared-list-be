import prismaClient from '../../prisma'

class GetSubscriptionService {
  async execute(userId: string) {
    if (!userId) {
      throw new Error('User ID is required')
    }

    // Get user with subscription information
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: {
        ownedSubscription: {
          select: {
            id: true,
            categories: true,
            currencySymbol: true,
            isActive: true,
          },
        },
        membershipSubscription: {
          select: {
            subscriptionId: true,
            canEdit: true,
            isActive: true,
            subscription: {
              select: {
                id: true,
                categories: true,
                currencySymbol: true,
                isActive: true,
              },
            },
          },
        },
      },
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Get the subscription (either owned or membership)
    const subscription =
      user.ownedSubscription || user.membershipSubscription?.subscription

    if (!subscription) {
      throw new Error('No subscription found for this user')
    }

    return {
      id: subscription.id,
      categories: subscription.categories,
      currencySymbol: subscription.currencySymbol,
      isActive: subscription.isActive,
      isOwner: !!user.ownedSubscription,
      canEdit:
        !!user.ownedSubscription ||
        (user.membershipSubscription?.canEdit &&
          user.membershipSubscription?.isActive),
    }
  }
}

export { GetSubscriptionService }
