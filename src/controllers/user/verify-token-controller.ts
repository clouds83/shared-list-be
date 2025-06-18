import { Request, Response } from 'express'
import { VerifyTokenService } from '../../services/user/verify-token-service'

class VerifyTokenController {
  async handle(req: Request, res: Response) {
    try {
      const authToken = req.headers.authorization

      if (!authToken) {
        return res.status(401).json({ error: 'Authorization header missing' })
      }

      // Extract token from "Bearer <token>" format
      const [bearer, token] = authToken.split(' ')

      if (bearer !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Invalid authorization format' })
      }

      const verifyTokenService = new VerifyTokenService()
      const user = await verifyTokenService.execute(token)

      return res.json(user)
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' })
    }
  }
}

export { VerifyTokenController } 