import { describe, expect, it, vi } from 'vitest'

import app from './app.js'
import { createTestJwt } from './utils/jwt.js'
import getPrismaClient from './utils/db.js'
import models from './models/index.js'
import { BLOCKED_TOKEN_STATUS_CODE } from './utils/securityUtils.js'

vi.unmock('./hooks/jwtCheck')

describe('Test routes when block active', () => {
  it('should be reachable with block because it is whitelisted', async () => {
    vi.spyOn(models.Organisation, 'hasPermission').mockResolvedValueOnce('200')
    const prisma = await getPrismaClient()
    const org = await prisma.organisation.findFirst()
    if (!org) throw new Error('Organisation not found')

    const user = await prisma.fWUser.findFirst({
      where: {
        organisationId: org!.id,
      },
    })
    if (!user) throw new Error('User not found')

    const jwt = await createTestJwt({
      type: 'fwo',
      id: user.id,
      hasAdminBlock: true,
      hasPaymentBlock: true,
    })

    const response = await app.inject({
      url: `/organisations/${org.id}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwt}`,
        'content-type': 'application/json',
      },
    })

    expect(response.statusCode).toBe(200)
  })

  it('should not be reachable with block', async () => {
    // vi.spyOn(models.FWUser, 'hasPermission').mockResolvedValueOnce('200')

    const prisma = await getPrismaClient()
    const org = await prisma.organisation.findFirst()
    if (!org) throw new Error('Organisation not found')

    const user = await prisma.fWUser.findFirst({
      where: {
        organisationId: org!.id,
      },
    })
    if (!user) throw new Error('User not found')

    const jwt = await createTestJwt({
      type: 'fwo',
      id: user.id,
      hasAdminBlock: true,
      hasPaymentBlock: true,
    })

    const response = await app.inject({
      url: `/nutrients`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    })

    expect(response.statusCode).toBe(BLOCKED_TOKEN_STATUS_CODE)
    expect(response.json()).toEqual({
      message: 'You do not have permission to access this resource',
      hasAdminBlock: true,
      hasPaymentBlock: true,
    })
  })
})
