import { Router } from 'express'
import { CreateOwnerController } from './controllers/user/create-owner-controller'
import { AuthUserController } from './controllers/user/auth-user-controller'
import { VerifyTokenController } from './controllers/user/verify-token-controller'
import { isAuthenticated } from './middlewares/isAuthenticated'
import { GetUserDetailsController } from './controllers/user/get-user-details-controller'
import { CreateMemberController } from './controllers/user/create-member-controller'
import { ManageMemberController } from './controllers/user/manage-member-controller'
import { GetSubscriptionMembersController } from './controllers/user/get-subscription-members-controller'
import { AddItemController } from './controllers/item/add-item-controller'
import { UpdateItemController } from './controllers/item/update-item-controller'
import { GetAllItemsController } from './controllers/item/get-all-items-controller'
import { GetSingleItemController } from './controllers/item/get-single-item-controller'
import { DeleteItemController } from './controllers/item/delete-item-controller'
import { ManageItemPricesController } from './controllers/item/manage-item-prices-controller'
import { GetSubscriptionController } from './controllers/subscription/get-subscription-controller'
import { GetCategoriesController } from './controllers/category/get-categories-controller'
import { CreateCategoryController } from './controllers/category/create-category-controller'
import { UpdateCategoryController } from './controllers/category/update-category-controller'
import { DeleteCategoryController } from './controllers/category/delete-category-controller'
import { GetUnitsController } from './controllers/unit/get-units-controller'
import { CreateUnitController } from './controllers/unit/create-unit-controller'
import { UpdateUnitController } from './controllers/unit/update-unit-controller'
import { DeleteUnitController } from './controllers/unit/delete-unit-controller'

const router = Router()

/* ####### user routes ####### */
router.post('/create-owner', new CreateOwnerController().handle)
router.post('/authenticate', new AuthUserController().handle)
router.post('/verify-token', new VerifyTokenController().handle)
router.get('/user', isAuthenticated, new GetUserDetailsController().handle)
router.post(
  '/create-member',
  isAuthenticated,
  new CreateMemberController().handle
)
router.get(
  '/subscription-members',
  isAuthenticated,
  new GetSubscriptionMembersController().handle
)
router.patch(
  '/grant-edit-permission',
  isAuthenticated,
  new ManageMemberController().grantEditPermission
)
router.patch(
  '/revoke-edit-permission',
  isAuthenticated,
  new ManageMemberController().revokeEditPermission
)
router.patch(
  '/update-member-status',
  isAuthenticated,
  new ManageMemberController().updateMemberStatus
)
// change password
// get subscription details
// delete user
// delete secondary user

/* ####### items routes ####### */
router.post('/add-item', isAuthenticated, new AddItemController().handle)
router.put('/update-item', isAuthenticated, new UpdateItemController().handle)
router.delete(
  '/delete-item',
  isAuthenticated,
  new DeleteItemController().handle
)
router.get('/items', isAuthenticated, new GetAllItemsController().handle)
router.get(
  '/items/:itemId',
  isAuthenticated,
  new GetSingleItemController().handle
)

/* ####### prices routes ####### */
router.post(
  '/item-prices',
  isAuthenticated,
  new ManageItemPricesController().addPrice
)
router.put(
  '/item-prices/:priceId',
  isAuthenticated,
  new ManageItemPricesController().updatePrice
)
router.delete(
  '/item-prices/:priceId',
  isAuthenticated,
  new ManageItemPricesController().deletePrice
)

/* ####### subscription routes ####### */
router.get(
  '/subscription',
  isAuthenticated,
  new GetSubscriptionController().handle
)

/* ####### category routes ####### */
router.get('/categories', isAuthenticated, new GetCategoriesController().handle)
router.post('/categories', isAuthenticated, new CreateCategoryController().handle)
router.put('/categories/:categoryId', isAuthenticated, new UpdateCategoryController().handle)
router.delete('/categories/:categoryId', isAuthenticated, new DeleteCategoryController().handle)

/* ####### unit routes ####### */
router.get('/units', isAuthenticated, new GetUnitsController().handle)
router.post('/units', isAuthenticated, new CreateUnitController().handle)
router.put('/units/:unitId', isAuthenticated, new UpdateUnitController().handle)
router.delete('/units/:unitId', isAuthenticated, new DeleteUnitController().handle)

export { router }
