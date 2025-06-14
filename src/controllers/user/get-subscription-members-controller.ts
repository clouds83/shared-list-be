import { Request, Response } from 'express'
import { GetSubscriptionMembersService } from '../../services/user/get-subscription-members-service'

class GetSubscriptionMembersController {
  async handle(req: Request, res: Response) {
    const { user_id: ownerId } = req

    try {
      const getSubscriptionMembersService = new GetSubscriptionMembersService()
      const members = await getSubscriptionMembersService.execute(ownerId)

      return res.json(members)
    } catch (error) {
      return res.status(400).json({ error: error.message })
    }
  }
}

export { GetSubscriptionMembersController } 