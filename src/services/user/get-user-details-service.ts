import prismaClient from '../../prisma'

class GetUserDetailsService {
  async execute(user_id: string) {
    const user = await prismaClient.user.findFirst({
      where: {
        id: user_id,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    })

    return user
  }
}

export { GetUserDetailsService }
