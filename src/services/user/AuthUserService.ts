import prismaClient from '../../prisma'
import { compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken'

interface AuthRequest {
  email: string
  password: string
}

class AuthUserService {
  async execute({ email, password }: AuthRequest) {
    const user = await prismaClient.user.findFirst({
      where: {
        email,
      },
    })

    if (!user) throw new Error('Email/Password incorrect')

    const passwordMatch = await compare(password, user.password)

    if (!passwordMatch) throw new Error('Email/Password incorrect')

    const token = sign(
      {
        name: user.firstName,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        subject: user.id,
        expiresIn: '30d',
      }
    )

    return { id: user.id, name: user.firstName, email: user.email, subscriptionId: user.subscriptionId, token: token }
  }
}

export { AuthUserService }
