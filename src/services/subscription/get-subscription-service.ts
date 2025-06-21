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

    // Fetch categories and units from separate tables
    const [categories, units] = await Promise.all([
      prismaClient.category.findMany({
        where: { subscriptionId: subscription.id },
        orderBy: { name: 'asc' },
        select: { id: true, name: true }
      }),
      prismaClient.unit.findMany({
        where: { subscriptionId: subscription.id },
        orderBy: { name: 'asc' },
        select: { id: true, name: true }
      })
    ])

    return {
      id: subscription.id,
      categories: categories.map(cat => ({ id: cat.id, name: cat.name })),
      units: units.map(unit => ({ id: unit.id, name: unit.name })),
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
