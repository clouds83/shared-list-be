import { Router, Request, Response } from 'express'
import { CreateUserController } from './controllers/user/CreateUserController'

const router = Router()

router.post('/create-user', new CreateUserController().handle)

export { router }
