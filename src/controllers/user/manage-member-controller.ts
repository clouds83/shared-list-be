import { Request, Response } from 'express'
import { ManageMemberService } from '../../services/user/manage-member-service'

class ManageMemberController {
  // Grant edit permission to a member
  async grantEditPermission(req: Request, res: Response) {
    const { user_id: ownerId } = req
    const { memberUserId } = req.body

    if (!memberUserId) {
      return res.status(400).json({ error: 'Member user ID is required' })
    }

    try {
      const manageMemberService = new ManageMemberService()
      const result = await manageMemberService.grantEditPermission({
        ownerId,
        memberUserId,
      })

      return res.json(result)
    } catch (error) {
      return res.status(400).json({ error: error.message })
    }
  }

  // Revoke edit permission from a member
  async revokeEditPermission(req: Request, res: Response) {
    const { user_id: ownerId } = req
    const { memberUserId } = req.body

    if (!memberUserId) {
      return res.status(400).json({ error: 'Member user ID is required' })
    }

    try {
      const manageMemberService = new ManageMemberService()
      const result = await manageMemberService.revokeEditPermission({
        ownerId,
        memberUserId,
      })

      return res.json(result)
    } catch (error) {
      return res.status(400).json({ error: error.message })
    }
  }

  // Update member status (activate/deactivate)
  async updateMemberStatus(req: Request, res: Response) {
    const { user_id: ownerId } = req
    const { memberUserId, isActive } = req.body

    if (!memberUserId || typeof isActive !== 'boolean') {
      return res.status(400).json({ 
        error: 'Member user ID and isActive (boolean) are required' 
      })
    }

    try {
      const manageMemberService = new ManageMemberService()
      const result = await manageMemberService.updateMemberStatus({
        ownerId,
        memberUserId,
        isActive,
      })

      return res.json(result)
    } catch (error) {
      return res.status(400).json({ error: error.message })
    }
  }
}

export { ManageMemberController } 