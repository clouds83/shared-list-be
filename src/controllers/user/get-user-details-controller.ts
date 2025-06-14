import { Request, Response } from 'express'
import { GetUserDetailsService } from '../../services/user/get-user-details-service'

class GetUserDetailsController {
  async handle(req: Request, res: Response) {
    const { user_id } = req

    const getUserDetails = new GetUserDetailsService()

    const user = await getUserDetails.execute(user_id)

    return res.json(user)
  }
}

export { GetUserDetailsController }
