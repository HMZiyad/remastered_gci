import { PrismaClient, Role, VehicleStatus, BodyType, FuelType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.sale.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.preOrder.deleteMany();
  await prisma.stockInward.deleteMany();
  await prisma.imageVariant.deleteMany();
  await prisma.vehiclePhoto.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding Admin User...');
  const initialPassword = process.env.ADMIN_INITIAL_PASSWORD || 'password123';
  const passwordHash = bcrypt.hashSync(initialPassword, 10);
  await prisma.user.create({
    data: {
      name: 'M. Rahman',
      email: 'admin@goodcarimports.com',
      password_hash: passwordHash,
      role: Role.admin,
      title: 'Managing Director',
      avatar_initials: 'MR',
    },
  });

  console.log('Seeding Vehicles...');
  await prisma.vehicle.createMany({
    data: [
      {
        stock_id: 'GCI-1001',
        car_name: 'Toyota Land Cruiser 300',
        package_trim: 'ZX Modellista',
        year_of_manufacture: 2024,
        color_name: 'Pearl White',
        auction_grade: '5.0',
        mileage_km: 4200,
        chassis_code: 'VJA300-0019482',
        transmission: '10-Speed AT',
        engine_cc: 3500,
        fuel_type: FuelType.Petrol,
        body_type: BodyType.SUV,
        brand: 'Toyota',
        status: VehicleStatus.available,
        price_bdt: BigInt("8500000000"), // 8.5 Crore paisa
        is_featured: true,
        badge_text: 'NEW ARRIVAL',
        slug: 'toyota-land-cruiser-300-zx-modellista-2024',
      },
      {
        stock_id: 'GCI-8829',
        car_name: 'Toyota Corolla Cross',
        package_trim: 'Z Package',
        year_of_manufacture: 2023,
        color_name: 'Attitude Black',
        auction_grade: '4.5',
        mileage_km: 12400,
        chassis_code: 'ZVG11-204812',
        transmission: 'e-CVT',
        engine_cc: 1800,
        fuel_type: FuelType.Hybrid,
        body_type: BodyType.Crossover,
        brand: 'Toyota',
        status: VehicleStatus.port_clearance,
        price_bdt: BigInt("4500000000"),
        is_featured: true,
        badge_text: 'NEW ARRIVAL',
        slug: 'toyota-corolla-cross-z-package-2023',
      },
      {
        stock_id: 'GCI-8830',
        car_name: 'Honda Vezel',
        package_trim: 'e:HEV Play',
        year_of_manufacture: 2021,
        color_name: 'Sand Khaki',
        auction_grade: '4.0',
        mileage_km: 21300,
        chassis_code: 'RV5-103982',
        transmission: 'e-CVT',
        engine_cc: 1500,
        fuel_type: FuelType.Hybrid,
        body_type: BodyType.SUV,
        brand: 'Honda',
        status: VehicleStatus.available,
        price_bdt: BigInt("4200000000"),
        is_featured: true,
        badge_text: 'Top Grade',
        slug: 'honda-vezel-ehev-play-2021',
      }
    ],
  });

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
