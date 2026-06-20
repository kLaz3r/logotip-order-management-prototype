import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import bcrypt from "bcryptjs"

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" })
const prisma = new PrismaClient({ adapter })

const productsData = [
  // Printare / Copiere color 90g
  { category: "Printare / Copiere color 90g", name: "Print color", format: "A4", quantityRange: "1 - 10 pag.", unit: "pag.", basePrice: 2.00 },
  { category: "Printare / Copiere color 90g", name: "Print color", format: "A4", quantityRange: "11 - 20 pag.", unit: "pag.", basePrice: 1.80 },
  { category: "Printare / Copiere color 90g", name: "Print color", format: "A4", quantityRange: "21 - 50 pag.", unit: "pag.", basePrice: 1.60 },
  { category: "Printare / Copiere color 90g", name: "Print color", format: "A4", quantityRange: "51 - 100 pag.", unit: "pag.", basePrice: 1.40 },
  { category: "Printare / Copiere color 90g", name: "Print color", format: "A4", quantityRange: "101 - 400 pag.", unit: "pag.", basePrice: 1.30 },
  { category: "Printare / Copiere color 90g", name: "Print color", format: "A4", quantityRange: "400 - 1000 pag.", unit: "pag.", basePrice: 1.10 },
  { category: "Printare / Copiere color 90g", name: "Print color", format: "A4", quantityRange: ">1000 pag.", unit: "pag.", basePrice: 1.00 },

  // Printare / Copiere alb-negru
  { category: "Printare / Copiere alb-negru", name: "Print alb-negru", format: "A4", quantityRange: "1 - 10 pag.", unit: "pag.", basePrice: 1.00 },
  { category: "Printare / Copiere alb-negru", name: "Print alb-negru", format: "A4", quantityRange: "11 - 30 pag.", unit: "pag.", basePrice: 0.50 },
  { category: "Printare / Copiere alb-negru", name: "Print alb-negru", format: "A4", quantityRange: "31 - 50 pag.", unit: "pag.", basePrice: 0.40 },
  { category: "Printare / Copiere alb-negru", name: "Print alb-negru", format: "A4", quantityRange: ">50 pag.", unit: "pag.", basePrice: 0.35 },

  // Copiere alb-negru carte
  { category: "Copiere alb-negru carte", name: "Copiere carte A4", format: "A4", unit: "pag.", basePrice: 0.50 },
  { category: "Copiere alb-negru carte", name: "Copiere carte A3", format: "A3", unit: "pag.", basePrice: 1.00 },

  // Preț carton
  { category: "Preț carton", name: "Carton 120-160g", format: "A4", quantityRange: "<500 pag.", unit: "pag.", basePrice: 0.30 },
  { category: "Preț carton", name: "Carton 120-160g", format: "A4", quantityRange: ">500 pag.", unit: "pag.", basePrice: 0.20 },
  { category: "Preț carton", name: "Carton 200-250g", format: "A4", quantityRange: "<500 pag.", unit: "pag.", basePrice: 0.50 },
  { category: "Preț carton", name: "Carton 200-250g", format: "A4", quantityRange: ">500 pag.", unit: "pag.", basePrice: 0.40 },
  { category: "Preț carton", name: "Carton 300g", format: "A4", quantityRange: "<500 pag.", unit: "pag.", basePrice: 0.60 },
  { category: "Preț carton", name: "Carton 300g", format: "A4", quantityRange: ">500 pag.", unit: "pag.", basePrice: 0.50 },

  // Laminare
  { category: "Laminare", name: "Laminare lucios", format: "A4", unit: "buc.", basePrice: 3.50 },
  { category: "Laminare", name: "Laminare mat", format: "A4", unit: "buc.", basePrice: 4.50 },

  // Imprimare formate mari
  { category: "Imprimare formate mari", name: "Etichete autocolante", unit: "mp", basePrice: 120.00, notes: "Comandă minimă: 30 lei" },
  { category: "Imprimare formate mari", name: "Autocolant", unit: "mp", basePrice: 100.00, notes: "Comandă minimă: 30 lei" },
  { category: "Imprimare formate mari", name: "Banner", unit: "mp", basePrice: 100.00, notes: "Comandă minimă: 30 lei" },
  { category: "Imprimare formate mari", name: "Carton foto", unit: "mp", basePrice: 120.00, notes: "Comandă minimă: 30 lei" },
  { category: "Imprimare formate mari", name: "Roll up", unit: "mp", basePrice: 100.00, notes: "Comandă minimă: 30 lei" },
  { category: "Imprimare formate mari", name: "Backlit / Canvas", unit: "mp", basePrice: 110.00, notes: "Comandă minimă: 30 lei" },
  { category: "Imprimare formate mari", name: "Windowgrafics", unit: "mp", basePrice: 110.00, notes: "Comandă minimă: 30 lei" },
  { category: "Imprimare formate mari", name: "Tapet printabil", unit: "mp", basePrice: 95.00, notes: "de la 95 lei/mp" },

  // Imprimare / copiere ALB NEGRU planșe
  { category: "Imprimare / copiere ALB NEGRU planșe", name: "Imprimare planșe", format: "A3", unit: "ml", basePrice: 4.20 },
  { category: "Imprimare / copiere ALB NEGRU planșe", name: "Copiere planșe", format: "A3", unit: "ml", basePrice: 4.70 },
  { category: "Imprimare / copiere ALB NEGRU planșe", name: "Imprimare planșe", format: "A2", unit: "ml", basePrice: 5.00 },
  { category: "Imprimare / copiere ALB NEGRU planșe", name: "Copiere planșe", format: "A2", unit: "ml", basePrice: 5.50 },
  { category: "Imprimare / copiere ALB NEGRU planșe", name: "Imprimare planșe", format: "A1", unit: "ml", basePrice: 6.00 },
  { category: "Imprimare / copiere ALB NEGRU planșe", name: "Copiere planșe", format: "A1", unit: "ml", basePrice: 6.50 },
  { category: "Imprimare / copiere ALB NEGRU planșe", name: "Imprimare planșe", format: "A0", unit: "ml", basePrice: 7.00 },
  { category: "Imprimare / copiere ALB NEGRU planșe", name: "Copiere planșe", format: "A0", unit: "ml", basePrice: 7.50 },
  { category: "Imprimare / copiere ALB NEGRU planșe", name: "Imprimare planșe", format: "E+", unit: "ml", basePrice: 7.50 },
  { category: "Imprimare / copiere ALB NEGRU planșe", name: "Copiere planșe", format: "E+", unit: "ml", basePrice: 8.50 },

  // Imprimare / copiere COLOR planșe mp.
  { category: "Imprimare / copiere COLOR planșe mp.", name: "Planșe color linii - imprimare", unit: "mp", basePrice: 34.00 },
  { category: "Imprimare / copiere COLOR planșe mp.", name: "Planșe color linii - copiere", unit: "mp", basePrice: 40.00 },
  { category: "Imprimare / copiere COLOR planșe mp.", name: "Planșe color mixt - imprimare", unit: "mp", basePrice: 40.00 },
  { category: "Imprimare / copiere COLOR planșe mp.", name: "Planșe color mixt - copiere", unit: "mp", basePrice: 50.00 },
  { category: "Imprimare / copiere COLOR planșe mp.", name: "Planșe color full - imprimare", unit: "mp", basePrice: 60.00 },
  { category: "Imprimare / copiere COLOR planșe mp.", name: "Planșe color full - copiere", unit: "mp", basePrice: 60.00 },

  // Pliere planșe
  { category: "Pliere planșe", name: "Pliere", format: "A3", unit: "buc.", basePrice: 2.00 },
  { category: "Pliere planșe", name: "Pliere", format: "A2-A0-E+", unit: "buc.", basePrice: 3.00 },

  // Scanare
  { category: "Scanare", name: "Scanare planșe", unit: "mp", basePrice: 10.00 },
  { category: "Scanare", name: "Scanare", format: "A4/A3", unit: "buc.", basePrice: 0.50 },

  // Cărți de vizită
  { category: "Cărți de vizită", name: "Cărți vizită", quantityRange: "50 buc.", unit: "buc.", basePrice: 0.55, notes: "Comandă minimă: 50 buc.", options: [{ name: "Față/verso", priceModifier: 0.15 }, { name: "Laminare lucios", priceModifier: 0.30 }, { name: "Laminare mat", priceModifier: 0.40 }] },
  { category: "Cărți de vizită", name: "Cărți vizită", quantityRange: "50 - 100 buc.", unit: "buc.", basePrice: 0.45, options: [{ name: "Față/verso", priceModifier: 0.15 }, { name: "Laminare lucios", priceModifier: 0.30 }, { name: "Laminare mat", priceModifier: 0.40 }] },
  { category: "Cărți de vizită", name: "Cărți vizită", quantityRange: ">500 buc.", unit: "buc.", basePrice: 0.40, options: [{ name: "Față/verso", priceModifier: 0.15 }, { name: "Laminare lucios", priceModifier: 0.30 }, { name: "Laminare mat", priceModifier: 0.40 }] },

  // Îndosariere
  { category: "Îndosariere", name: "Îndosariere arc plastic", quantityRange: "<50 pag.", unit: "buc.", basePrice: 8.00 },
  { category: "Îndosariere", name: "Îndosariere arc plastic", quantityRange: "50 - 100 pag.", unit: "buc.", basePrice: 10.00 },
  { category: "Îndosariere", name: "Îndosariere arc plastic", quantityRange: ">100 pag.", unit: "buc.", basePrice: 15.00 },
  { category: "Îndosariere", name: "Îndosariere arc metalic", unit: "buc.", basePrice: 12.00 },

  // Legare
  { category: "Legare", name: "Legare Lucrare de licență/disertație", unit: "buc.", basePrice: 0, optionType: "single", options: [{ name: "Copertă carton 250g.", priceModifier: 45 }, { name: "Copertă imitație piele", priceModifier: 65 }] },

  // Tipizate
  { category: "Tipizate", name: "Tipizate", format: "A4", quantityRange: "3 file", unit: "buc.", basePrice: 45.00 },
  { category: "Tipizate", name: "Tipizate", format: "A4", quantityRange: "2 file", unit: "buc.", basePrice: 35.00 },
  { category: "Tipizate", name: "Tipizate", format: "A5", quantityRange: "3 file", unit: "buc.", basePrice: 28.00 },
  { category: "Tipizate", name: "Tipizate", format: "A5", quantityRange: "2 file", unit: "buc.", basePrice: 24.00 },
  { category: "Tipizate", name: "Tipizate", format: "A6", quantityRange: "3 file", unit: "buc.", basePrice: 18.00 },
  { category: "Tipizate", name: "Tipizate", format: "A6", quantityRange: "2 file", unit: "buc.", basePrice: 14.00 },

  // Șablon
  { category: "Șablon", name: "Autocolant sablare", unit: "mp", basePrice: 70.00 },
  { category: "Șablon", name: "Folie transfer", unit: "mp", basePrice: 20.00 },
  { category: "Șablon", name: "Tăiere", unit: "mp", basePrice: 50.00 },
  { category: "Șablon", name: "Redactare șablon", unit: "buc.", basePrice: 15.00, notes: "15-20 lei/șablon" },

  // Tablouri canvas
  { category: "Tablouri canvas", name: "Tablou canvas 30x40", unit: "buc.", basePrice: 85.00 },
  { category: "Tablouri canvas", name: "Tablou canvas 45x60", unit: "buc.", basePrice: 127.00 },
  { category: "Tablouri canvas", name: "Tablou canvas 50x70", unit: "buc.", basePrice: 150.00 },
  { category: "Tablouri canvas", name: "Tablou canvas 70x100", unit: "buc.", basePrice: 248.00 },

  // Ecuson
  { category: "Ecuson", name: "Ecuson complet (1 buc)", unit: "buc.", basePrice: 20.00 },
  { category: "Ecuson", name: "Ecuson complet (≥3 buc)", unit: "buc.", basePrice: 12.00 },
  { category: "Ecuson", name: "Ecuson cu clips", unit: "buc.", basePrice: 8.00 },
  { category: "Ecuson", name: "Ecuson cu inserție", unit: "buc.", basePrice: 5.00 },
  { category: "Ecuson", name: "Șnur", unit: "buc.", basePrice: 3.00 },
  { category: "Ecuson", name: "Ecuson cu lanț", unit: "buc.", basePrice: 12.00 },
  { category: "Ecuson", name: "Lanț", unit: "buc.", basePrice: 5.00 },

  // Servicii diverse
  { category: "Servicii diverse", name: "Editare grafică", unit: "15 min.", basePrice: 30.00 },
  { category: "Servicii diverse", name: "Panou șantier", unit: "buc.", basePrice: 120.00 },
  { category: "Servicii diverse", name: "Personalizări diverse (minim)", unit: "buc.", basePrice: 30.00 },

  // Diverse materiale
  { category: "Diverse materiale", name: "Autocolant simplu", unit: "mp", basePrice: 50.00 },
  { category: "Diverse materiale", name: "Aplicare autocolant", unit: "mp", basePrice: 20.00, notes: "20-50 lei/mp" },
  { category: "Diverse materiale", name: "Carton special A4", format: "A4", unit: "coală", basePrice: 4.00 },
  { category: "Diverse materiale", name: "Top hârtie A4", format: "A4", unit: "top", basePrice: 40.00 },

  // PVC
  { category: "PVC", name: "PVC 1mm", unit: "mp", basePrice: 50.00, notes: "Dimensiune coală: 2050x3050mm. Reducere coală întreagă: -10%" },
  { category: "PVC", name: "PVC 2mm", unit: "mp", basePrice: 55.00 },
  { category: "PVC", name: "PVC 3mm", unit: "mp", basePrice: 60.00 },
  { category: "PVC", name: "PVC 5mm", unit: "mp", basePrice: 95.00 },
  { category: "PVC", name: "PVC 10mm", unit: "mp", basePrice: 180.00 },

  // Alucobond
  { category: "Alucobond", name: "Alucobond 2mm", unit: "mp", basePrice: 190.00, notes: "Dimensiune coală: 3050x1500mm. Reducere coală întreagă: -10%" },
  { category: "Alucobond", name: "Alucobond 3mm", unit: "mp", basePrice: 210.00 },

  // Plexiglas
  { category: "Plexiglas", name: "Plexiglas 2mm", unit: "mp", basePrice: 145.00, notes: "Dimensiune coală: 2050x3050mm. Reducere coală întreagă: -10%" },
  { category: "Plexiglas", name: "Plexiglas 3mm", unit: "mp", basePrice: 180.00 },
  { category: "Plexiglas", name: "Plexiglas 5mm", unit: "mp", basePrice: 270.00 },

  // Papetărie
  { category: "Papetărie", name: "Dosare plic cu șină", unit: "buc.", basePrice: 2.50 },
  { category: "Papetărie", name: "Stick USB 32GB", unit: "buc.", basePrice: 40.00 },
  { category: "Papetărie", name: "Stick USB 64GB", unit: "buc.", basePrice: 48.00 },
  { category: "Papetărie", name: "Dosar plastic A4", unit: "buc.", basePrice: 2.50 },
  { category: "Papetărie", name: "Biblioraft", unit: "buc.", basePrice: 15.00 },
  { category: "Papetărie", name: "Plic A4 cu burduf", unit: "buc.", basePrice: 5.00 },
  { category: "Papetărie", name: "Plic A4", unit: "buc.", basePrice: 2.50 },
  { category: "Papetărie", name: "Plic A5", unit: "buc.", basePrice: 1.50 },
  { category: "Papetărie", name: "Plic C6 lung", unit: "buc.", basePrice: 0.60 },
  { category: "Papetărie", name: "Plic C6", unit: "buc.", basePrice: 0.60 },
  { category: "Papetărie", name: "Plic CD", unit: "buc.", basePrice: 1.00 },
  { category: "Papetărie", name: "Pixuri", unit: "buc.", basePrice: 2.00 },
  { category: "Papetărie", name: "Creioane", unit: "buc.", basePrice: 1.00 },
  { category: "Papetărie", name: "Marker permanent", unit: "buc.", basePrice: 6.00 },
  { category: "Papetărie", name: "Agrafe", unit: "buc.", basePrice: 3.00 },
  { category: "Papetărie", name: "Capse", unit: "buc.", basePrice: 3.00 },
  { category: "Papetărie", name: "Mapă plastic A4", unit: "buc.", basePrice: 5.00 },
  { category: "Papetărie", name: "Mapă plastic A5", unit: "buc.", basePrice: 4.00 },
  { category: "Papetărie", name: "Scriere CD/DVD", unit: "buc.", basePrice: 20.00 },
  { category: "Papetărie", name: "CD", unit: "buc.", basePrice: 3.00 },
  { category: "Papetărie", name: "DVD", unit: "buc.", basePrice: 3.00 },
]

async function main() {
  console.log("Seeding database...")

  // Seed admin user
  const adminPasswordHash = await bcrypt.hash("admin123", 12)
  const admin = await prisma.user.upsert({
    where: { email: "admin@logotip.md" },
    update: { active: true },
    create: {
      name: "Administrator",
      email: "admin@logotip.md",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      active: true,
    },
  })
  console.log(`Admin user: ${admin.email}`)

  // Seed employee user
  const employeePasswordHash = await bcrypt.hash("angajat123", 12)
  const employee = await prisma.user.upsert({
    where: { email: "angajat@logotip.md" },
    update: { active: true },
    create: {
      name: "Angajat Test",
      email: "angajat@logotip.md",
      passwordHash: employeePasswordHash,
      role: "EMPLOYEE",
      active: true,
    },
  })
  console.log(`Employee user: ${employee.email}`)

  // Seed products
  const existingCount = await prisma.product.count()
  if (existingCount === 0) {
    await prisma.product.createMany({
      data: productsData.map((p) => {
        const record: Record<string, unknown> = {
          category: p.category,
          name: p.name,
          format: p.format ?? null,
          quantityRange: p.quantityRange ?? null,
          unit: p.unit,
          basePrice: p.basePrice,
          notes: p.notes ?? null,
          optionType: (p as Record<string, unknown>).optionType ?? null,
          active: true,
        }
        const opts = (p as Record<string, unknown>).options
        if (opts) record.options = opts
        return record
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any,
    })
    console.log(`Created ${productsData.length} products`)
  } else {
    console.log(`Products already exist (${existingCount} found), skipping product seed`)
  }
}

main()
  .catch((e) => {
    console.error("Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
