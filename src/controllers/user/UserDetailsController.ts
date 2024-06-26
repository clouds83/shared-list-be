import { Request, Response } from 'express'
import { UserDetailsService } from '../../services/user/UserDetailsService'

class UserDetailsController {
  async handle(req: Request, res: Response) {
    const { user_id } = req

    const userDetailsService = new UserDetailsService()

    const user = await userDetailsService.execute(user_id)

    return res.json(user)
  }
}

export { UserDetailsController }
