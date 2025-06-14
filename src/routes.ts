import { Router } from 'express'
import { CreateOwnerController } from './controllers/user/create-owner-controller'
import { AuthUserController } from './controllers/user/auth-user-controller'
import { isAuthenticated } from './middlewares/isAuthenticated'
import { GetUserDetailsController } from './controllers/user/get-user-details-controller'
import { CreateMemberController } from './controllers/user/create-member-controller'
import { ManageMemberController } from './controllers/user/manage-member-controller'
import { GetSubscriptionMembersController } from './controllers/user/get-subscription-members-controller'
import { AddItemController } from './controllers/item/AddItemController'
import { UpdateItemController } from './controllers/item/UpdateItemController'
import { GetAllItemsController } from './controllers/item/GetAllItemsController'
import { DeleteItemController } from './controllers/item/DeleteItemController'

const router = Router()

/* ####### user routes ####### */
router.post('/create-owner', new CreateOwnerController().handle)
router.post('/authenticate', new AuthUserController().handle)
router.get('/user', isAuthenticated, new GetUserDetailsController().handle)
router.post('/create-member', isAuthenticated, new CreateMemberController().handle)
router.get('/subscription-members', isAuthenticated, new GetSubscriptionMembersController().handle)
router.patch('/grant-edit-permission', isAuthenticated, new ManageMemberController().grantEditPermission)
router.patch('/revoke-edit-permission', isAuthenticated, new ManageMemberController().revokeEditPermission)
router.patch('/update-member-status', isAuthenticated, new ManageMemberController().updateMemberStatus)
// change password
// get subscription details
// delete user
// delete secondary user

/* ####### items routes ####### */
router.post('/add-item', isAuthenticated, new AddItemController().handle)
router.put('/update-item', isAuthenticated, new UpdateItemController().handle)
router.delete('/delete-item', isAuthenticated, new DeleteItemController().handle)
router.get('/all-items', isAuthenticated, new GetAllItemsController().handle)

export { router }
