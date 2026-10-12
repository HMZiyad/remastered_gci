import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const v = await prisma.vehicle.findMany({ select: { id: true, slug: true } })
  console.log(v)
}
main()
