import { Router, Request, Response } from 'express'
import { CreateUserController } from './controllers/user/CreateUserController'
import { AuthUserController } from './controllers/user/AuthUserController'

const router = Router()

router.post('/create-user', new CreateUserController().handle)
router.post('/authenticate', new AuthUserController().handle)

export { router }
