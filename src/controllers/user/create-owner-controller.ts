import { Request, Response } from 'express'
import { CreateOwnerService } from '../../services/user/create-owner-service'

class CreateOwnerController {
  async handle(request: Request, response: Response) {
    const { firstName, lastName, email: rawEmail, password } = request.body

    const createOwner = new CreateOwnerService()

    const user = await createOwner.execute({ firstName, lastName, rawEmail, password })

    return response.json(user)
  }
}

export { CreateOwnerController }
