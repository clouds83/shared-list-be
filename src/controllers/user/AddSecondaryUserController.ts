import { Request, Response } from 'express'
import { AddSecondaryUserService } from '../../services/user/AddSecondaryUserService'

class AddSecondaryUserController {
  async handle(req: Request, res: Response) {
    const { user_id: subscription_owner_id } = req
    const { firstName, lastName, email, password } = req.body

    const createAddSecondaryUserService = new AddSecondaryUserService()

    const user = await createAddSecondaryUserService.execute({
      firstName,
      lastName,
      email,
      password,
      subscription_owner_id,
    })

    return res.json(user)
  }
}

export { AddSecondaryUserController }
