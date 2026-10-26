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
        stock_id: 'GCI-7001',
        car_name: 'TOYOTA HIACE',
        package_trim: 'DARK PRIME V2',
        year_of_manufacture: 2022,
        color_name: 'PEARL',
        auction_grade: '3.5',
        mileage_km: 164546,
        chassis_code: 'TRH200-019482',
        transmission: 'AT',
        engine_cc: 2000,
        fuel_type: FuelType.Petrol,
        body_type: BodyType.HIACE_Van,
        brand: 'Toyota',
        status: VehicleStatus.available,
        price_bdt: BigInt("435000000"), // ৳43.5L
        cover_photo: '/images/stock/toyota-hiace-pearl.jpg',
        description: 'Hello This is a Test description',
        is_featured: true,
        badge_text: 'READY STOCK',
        slug: 'toyota-hiace-dark-prime-v2-2022',
      },
      {
        stock_id: 'GCI-7002',
        car_name: 'TOYOTA COROLLA CROSS HYBRID',
        package_trim: 'Z LEATHER',
        year_of_manufacture: 2022,
        color_name: 'PEARL',
        auction_grade: '5.0',
        mileage_km: 13427,
        chassis_code: 'ZVG11-204812',
        transmission: 'AT',
        engine_cc: 1800,
        fuel_type: FuelType.Hybrid,
        body_type: BodyType.Crossover,
        brand: 'Toyota',
        status: VehicleStatus.available,
        price_bdt: BigInt("460000000"), // ৳46.0L
        cover_photo: '/images/stock/corolla-cross-pearl.jpg',
        is_featured: true,
        badge_text: 'READY STOCK',
        slug: 'toyota-corolla-cross-hybrid-z-leather-2022-pearl',
      },
      {
        stock_id: 'GCI-7003',
        car_name: 'TOYOTA COROLLA CROSS HYBRID',
        package_trim: 'Z LEATHER',
        year_of_manufacture: 2022,
        color_name: 'BLACK',
        auction_grade: '4.5',
        mileage_km: 35613,
        chassis_code: 'ZVG11-205943',
        transmission: 'AT',
        engine_cc: 1800,
        fuel_type: FuelType.Hybrid,
        body_type: BodyType.Crossover,
        brand: 'Toyota',
        status: VehicleStatus.available,
        price_bdt: BigInt("450000000"), // ৳45.0L
        cover_photo: '/images/stock/corolla-cross-black.jpg',
        is_featured: true,
        badge_text: 'READY STOCK',
        slug: 'toyota-corolla-cross-hybrid-z-leather-2022-black',
      },
      {
        stock_id: 'GCI-7004',
        car_name: 'TOYOTA COROLLA CROSS HYBRID',
        package_trim: 'Z LEATHER',
        year_of_manufacture: 2024,
        color_name: 'PEARL TWO TONE',
        auction_grade: '5.0',
        mileage_km: 28388,
        chassis_code: 'ZVG15-401923',
        transmission: 'AT',
        engine_cc: 1800,
        fuel_type: FuelType.Hybrid,
        body_type: BodyType.Crossover,
        brand: 'Toyota',
        status: VehicleStatus.available,
        price_bdt: BigInt("510000000"), // ৳51.0L
        cover_photo: '/images/stock/corolla-cross-twotone.jpg',
        is_featured: true,
        badge_text: 'NEW ARRIVAL',
        slug: 'toyota-corolla-cross-hybrid-z-leather-2024-pearl-two-tone',
      },
      {
        stock_id: 'GCI-7005',
        car_name: 'TOYOTA COROLLA CROSS HYBRID',
        package_trim: 'Z LEATHER',
        year_of_manufacture: 2024,
        color_name: 'BLACKISH PURPLE',
        auction_grade: '4.5',
        mileage_km: 28180,
        chassis_code: 'ZVG15-402851',
        transmission: 'AT',
        engine_cc: 1800,
        fuel_type: FuelType.Hybrid,
        body_type: BodyType.Crossover,
        brand: 'Toyota',
        status: VehicleStatus.available,
        price_bdt: BigInt("500000000"), // ৳50.0L
        cover_photo: '/images/stock/corolla-cross-purple.jpg',
        is_featured: true,
        badge_text: 'NEW ARRIVAL',
        slug: 'toyota-corolla-cross-hybrid-z-leather-2024-blackish-purple',
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
