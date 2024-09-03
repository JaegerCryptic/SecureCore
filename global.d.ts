/* eslint-disable no-var */
// stack overflow says this needs to be "var"
// https://stackoverflow.com/questions/68481686/type-typeof-globalthis-has-no-index-signature
declare global {
  var prisma: PrismaClient
}

export {}
