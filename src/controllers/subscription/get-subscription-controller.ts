import { Request, Response } from 'express'
import { GetSubscriptionService } from '../../services/subscription/get-subscription-service'

class GetSubscriptionController {
  async handle(req: Request, res: Response) {
    const { user_id: userId } = req

    try {
      const getSubscriptionService = new GetSubscriptionService()
      const subscription = await getSubscriptionService.execute(userId)

      return res.json(subscription)
    } catch (error) {
      return res.status(400).json({ error: error.message })
    }
  }
}

export { GetSubscriptionController }
