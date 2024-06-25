import { Request, Response } from 'express'
import { CreateUserService } from '../../services/user/CreateUserService'

class CreateUserController {
  async handle(request: Request, response: Response) {
    const { firstName, lastName, email, password } = request.body

    const createUserService = new CreateUserService()

    const user = await createUserService.execute({ firstName, lastName, email, password })

    return response.json(user)
  }
}

export { CreateUserController }
