import prismaClient from '../../prisma'
import { compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken'

interface AuthRequest {
  email: string
  password: string
}

class AuthUserService {
  async execute({ email, password }: AuthRequest) {
    const user = await prismaClient.user.findUnique({
      where: {
        email,
      },
    })
    if (!user) throw new Error('Email not found')

    const { id, firstName, lastName, subscriptionId, password: storedPassword } = user

    const passwordMatch = await compare(password, storedPassword)
    if (!passwordMatch) throw new Error('Password incorrect')

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

    return { id, firstName, lastName, email, subscriptionId, token }
  }
}

export { AuthUserService }
