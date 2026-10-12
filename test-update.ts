import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  try {
    await prisma.vehicle.update({
      where: { id: 1 },
      data: { fuel_type: "Petrol-Hybrid" as any }
    })
    console.log("Success")
  } catch (e: any) {
    console.error(e.message)
  }
}
main()
