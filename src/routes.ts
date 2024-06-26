import { Router, Request, Response } from 'express'
import { CreateUserController } from './controllers/user/CreateUserController'
import { AuthUserController } from './controllers/user/AuthUserController'
import { isAuthenticated } from './middlewares/isAuthenticated'
import { UserDetailsController } from './controllers/user/UserDetailsController'

const router = Router()

router.post('/create-user', new CreateUserController().handle)
router.post('/authenticate', new AuthUserController().handle)
router.get('/user', isAuthenticated, new UserDetailsController().handle)

export { router }
