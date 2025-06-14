import { Request, Response } from 'express'
import { CreateMemberService } from '../../services/user/create-member-service'

class CreateMemberController {
  async handle(req: Request, res: Response) {
    const { user_id: subscription_owner_id } = req
    const { firstName, lastName, email: rawEmail, password } = req.body

    const createMember = new CreateMemberService()

    const user = await createMember.execute({
      firstName,
      lastName,
      rawEmail,
      password,
      subscription_owner_id,
    })

    return res.json(user)
  }
}

export { CreateMemberController }
