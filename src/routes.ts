import { FastifyInstance } from 'fastify'

import blockCheck from './hooks/blockCheck.js'
import nutrientsRoute from './endpoints/nutrients/index.js'
import clientsRoute from './endpoints/clients/index.js'
import workspacesRoute from './endpoints/workspaces/index.js'
import tagRoutes from './endpoints/tags/index.js'
import measuresRoutes from './endpoints/measures/index.js'
import resourceRoutes from './endpoints/resource/index.js'
import bulkEditRoutes from './endpoints/workspaces/workspace/bulkEdit/index.js'
import storageInstructionsRoutes from './endpoints/storage-instructions/index.js'
import ingredientGroupsRoutes from './endpoints/ingredient-groups/index.js'
import nutrientFilterRoutes from './endpoints/nutrient-filters/index.js'
import retentionFactorRoutes from './endpoints/retentionFactors/index.js'
import organisationRoutes from './endpoints/organisations/index.js'
import inviteRoutes from './endpoints/invites/index.js'
import eddUsersRoutes from './endpoints/eddUsers/index.js'
import fwUserRoutes from './endpoints/fwUsers/index.js'
import eddLogin from './endpoints/eddUsers/login/index.js'
import fwLogin from './endpoints/fwUsers/login.post.js'
import eddResetPasswordCode from './endpoints/eddUsers/reset-password-code.post.js'
import eddValidatePasswordCode from './endpoints/eddUsers/reset-password-code.patch.js'
import fwSignUp from './endpoints/fwUsers/users.post.js'
import eddSignUp from './endpoints/eddUsers/users.post.js'
import eddVerifyEmail from './endpoints/eddUsers/verify-email.post.js'
import fwVerifyEmail from './endpoints/fwUsers/verify-email.post.js'
import eddResendVerification from './endpoints/eddUsers/resend-email-verification.post.js'
import fwResendVerification from './endpoints/fwUsers/resend-email-verification.post.js'
import fwResetPasswordCode from './endpoints/fwUsers/forgot-password-request.post.js'
import fwValidatePasswordCode from './endpoints/fwUsers/forgot-password-reset.post.js'
import fwoRefreshToken from './endpoints/fwUsers/refresh.post.js'
import eddRefreshToken from './endpoints/eddUsers/refresh.post.js'
import webhookRoutes from './endpoints/webhooks/index.js'
import productRoutes from './endpoints/products/index.js'
import exerciseRoutes from './endpoints/exercises/index.js'
import fileUpload from './endpoints/uploads/index.js'
import errorRoutes from './endpoints/errors/index.js'
import sectionRoutes from './endpoints/sections/index.js'
import rowRoutes from './endpoints/rows/index.js'
import msLoginPost from './endpoints/admin/msLogin.post.js'
import dataSourcesRoutes from './endpoints/data-sources/index.js'
import getDataSources from './endpoints/data-sources/data-sources.get.js'
import getCountryOfOriginLabel from './endpoints/country-of-origin-label/country-of-origin.get.js'
import resourceEntryRoutes from './endpoints/resource-entry/index.js'
import adminPortalRoutes from './endpoints/admin/index.js'
import resourceTreeGet from './endpoints/resource-tree/resource-tree.get.js'

const authenticated = (fastify: FastifyInstance) => {
  fastify.register((instance, _opts, done) => {
    // ALL ROUTES THAT REQUIRE AUTHENTICATION & WILL BE BLOCKED BY ADMIN
    // HOOK TO CHECK FOR BLOCKS AND DENY ACCESS
    nutrientsRoute(instance)
    clientsRoute(instance)
    tagRoutes(instance)
    resourceRoutes(instance)
    bulkEditRoutes(instance)
    measuresRoutes(instance)
    storageInstructionsRoutes(instance)
    ingredientGroupsRoutes(instance)
    nutrientFilterRoutes(instance)
    retentionFactorRoutes(instance)
    eddUsersRoutes(instance)
    inviteRoutes(instance)
    productRoutes(instance)
    exerciseRoutes(instance)
    fileUpload(instance)
    errorRoutes(instance)
    sectionRoutes(instance)
    rowRoutes(instance)
    dataSourcesRoutes(instance)
    getCountryOfOriginLabel(instance)
    resourceEntryRoutes(instance)
    adminPortalRoutes(instance)
    resourceTreeGet(instance)
    instance.addHook('preParsing', blockCheck)
    done()
  })

  // WHITELISTED ROUTES TO AVOID ADMIN BLOCKS
  // ONLY SO THAT THE USER CAN FIX THE BLOCKS e.g MAKE PAYMENT
  fwUserRoutes(fastify)
  organisationRoutes(fastify)
  workspacesRoute(fastify)
}

const unauthenticated = (fastify: FastifyInstance) => {
  fwSignUp(fastify)
  eddSignUp(fastify)
  eddResetPasswordCode(fastify)
  eddValidatePasswordCode(fastify)
  fwResetPasswordCode(fastify)
  fwValidatePasswordCode(fastify)
  eddLogin(fastify)
  fwLogin(fastify)
  eddVerifyEmail(fastify)
  fwVerifyEmail(fastify)
  eddResendVerification(fastify)
  fwResendVerification(fastify)
  fwoRefreshToken(fastify)
  eddRefreshToken(fastify)
  webhookRoutes(fastify)
  getDataSources(fastify) // This is a public route and returns only public data
  msLoginPost(fastify)
}

export default {
  authenticated,
  unauthenticated,
}
