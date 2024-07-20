import { Router, Request, Response } from 'express'
import { CreateUserController } from './controllers/user/CreateUserController'
import { AuthUserController } from './controllers/user/AuthUserController'
import { isAuthenticated } from './middlewares/isAuthenticated'
import { UserDetailsController } from './controllers/user/UserDetailsController'
import { AddSecondaryUserController } from './controllers/user/AddSecondaryUserController'
import { AddItemController } from './controllers/item/AddItemController'
import { UpdateItemController } from './controllers/item/UpdateItemController'
import { GetAllItemsController } from './controllers/item/GetAllItemsController'

const router = Router()

/* ####### user routes ####### */
router.post('/create-user', new CreateUserController().handle)
router.post('/authenticate', new AuthUserController().handle)
router.get('/user', isAuthenticated, new UserDetailsController().handle)
router.post('/add-secondary-user', isAuthenticated, new AddSecondaryUserController().handle)
// change password
// get subscription details
// delete user
// delete secondary user

/* ####### items routes ####### */
router.post('/add-item', isAuthenticated, new AddItemController().handle)
router.put('/update-item', isAuthenticated, new UpdateItemController().handle)
router.get('/all-items', isAuthenticated, new GetAllItemsController().handle)
// delete item

export { router }
