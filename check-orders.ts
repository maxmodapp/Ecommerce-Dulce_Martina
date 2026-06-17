import { prisma } from "@/lib/prisma"

async function main() {
  console.log("Buscando órdenes...")
  
  const ordenes = await prisma.ordenes.findMany({
    take: 10,
  })
  
  console.log(`Total de órdenes encontradas: ${ordenes.length}`)
  console.log(JSON.stringify(ordenes, null, 2))
  
  // También intenta buscar la orden 1 específicamente
  const orden1 = await prisma.ordenes.findUnique({
    where: { id: BigInt(1) }
  })
  
  console.log("Orden ID 1:", orden1)
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
