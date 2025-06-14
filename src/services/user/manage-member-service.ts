import prismaClient from '../../prisma'

interface GrantEditPermissionRequest {
  ownerId: string
  memberUserId: string
}

interface RevokeEditPermissionRequest {
  ownerId: string
  memberUserId: string
}

interface UpdateMemberStatusRequest {
  ownerId: string
  memberUserId: string
  isActive: boolean
}

class ManageMemberService {
  // Grant edit permission to a member
  async grantEditPermission({ ownerId, memberUserId }: GrantEditPermissionRequest) {
    // First verify that the requester is the owner of the subscription
    const ownerSubscription = await prismaClient.subscription.findFirst({
      where: {
        ownerId,
      },
    })

    if (!ownerSubscription) {
      throw new Error('Only the subscription owner can grant edit permissions')
    }

    // Update the member's edit permission
    const updatedMember = await prismaClient.subscriptionMember.update({
      where: {
        userId: memberUserId,
      },
      data: {
        canEdit: true,
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
    })

    // Verify the member belongs to the owner's subscription
    if (updatedMember.subscriptionId !== ownerSubscription.id) {
      throw new Error('Member does not belong to your subscription')
    }

    return updatedMember
  }

  // Revoke edit permission from a member
  async revokeEditPermission({ ownerId, memberUserId }: RevokeEditPermissionRequest) {
    // First verify that the requester is the owner of the subscription
    const ownerSubscription = await prismaClient.subscription.findFirst({
      where: {
        ownerId,
      },
    })

    if (!ownerSubscription) {
      throw new Error('Only the subscription owner can revoke edit permissions')
    }

    // Update the member's edit permission
    const updatedMember = await prismaClient.subscriptionMember.update({
      where: {
        userId: memberUserId,
      },
      data: {
        canEdit: false,
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
    })

    // Verify the member belongs to the owner's subscription
    if (updatedMember.subscriptionId !== ownerSubscription.id) {
      throw new Error('Member does not belong to your subscription')
    }

    return updatedMember
  }

  // Activate or deactivate a member
  async updateMemberStatus({ ownerId, memberUserId, isActive }: UpdateMemberStatusRequest) {
    // First verify that the requester is the owner of the subscription
    const ownerSubscription = await prismaClient.subscription.findFirst({
      where: {
        ownerId,
      },
    })

    if (!ownerSubscription) {
      throw new Error('Only the subscription owner can change member status')
    }

    // Update the member's active status
    const updatedMember = await prismaClient.subscriptionMember.update({
      where: {
        userId: memberUserId,
      },
      data: {
        isActive,
        // If deactivating, also remove edit permissions
        ...(isActive === false && { canEdit: false }),
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
    })

    // Verify the member belongs to the owner's subscription
    if (updatedMember.subscriptionId !== ownerSubscription.id) {
      throw new Error('Member does not belong to your subscription')
    }

    return updatedMember
  }


}

export { ManageMemberService } 