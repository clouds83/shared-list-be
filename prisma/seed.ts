import { PrismaClient, StockLevel } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed process...')

  // Clear existing data (optional - remove if you want to preserve existing data)
  console.log('🧹 Cleaning existing data...')
  await prisma.itemPrice.deleteMany()
  await prisma.item.deleteMany()
  await prisma.subscriptionMember.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.user.deleteMany()

  // Hash password for all users (same password for simplicity)
  const hashedPassword = await bcrypt.hash('123123', 8)

  // Create Subscription Owners
  console.log('👥 Creating subscription owners...')
  const owner1 = await prisma.user.create({
    data: {
      email: 'john.smith@example.com',
      firstName: 'John',
      lastName: 'Smith',
      password: hashedPassword,
    },
  })

  const owner2 = await prisma.user.create({
    data: {
      email: 'jane.doe@example.com',
      firstName: 'Jane',
      lastName: 'Doe',
      password: hashedPassword,
    },
  })

  // Create Subscriptions
  console.log('📋 Creating subscriptions...')
  const subscription1 = await prisma.subscription.create({
    data: {
      ownerId: owner1.id,
      currencySymbol: '$',
      categories: ['Groceries', 'Household', 'Electronics'],
    },
  })

  const subscription2 = await prisma.subscription.create({
    data: {
      ownerId: owner2.id,
      currencySymbol: 'R$',
      categories: ['Comida', 'Casa', 'Tecnologia'],
    },
  })

  // Create Member Users
  console.log('👤 Creating member users...')
  const member1 = await prisma.user.create({
    data: {
      email: 'alice.johnson@example.com',
      firstName: 'Alice',
      lastName: 'Johnson',
      password: hashedPassword,
    },
  })

  const member2 = await prisma.user.create({
    data: {
      email: 'bob.wilson@example.com',
      firstName: 'Bob',
      lastName: 'Wilson',
      password: hashedPassword,
    },
  })

  const member3 = await prisma.user.create({
    data: {
      email: 'carlos.silva@example.com',
      firstName: 'Carlos',
      lastName: 'Silva',
      password: hashedPassword,
    },
  })

  const member4 = await prisma.user.create({
    data: {
      email: 'maria.santos@example.com',
      firstName: 'Maria',
      lastName: 'Santos',
      password: hashedPassword,
    },
  })

  // Create Subscription Memberships
  console.log('🔗 Creating subscription memberships...')
  
  // Members for Subscription 1 (John's subscription)
  await prisma.subscriptionMember.create({
    data: {
      userId: member1.id,
      subscriptionId: subscription1.id,
      canEdit: true, // Alice can edit
    },
  })

  await prisma.subscriptionMember.create({
    data: {
      userId: member2.id,
      subscriptionId: subscription1.id,
      canEdit: false, // Bob cannot edit
    },
  })

  // Members for Subscription 2 (Jane's subscription)
  await prisma.subscriptionMember.create({
    data: {
      userId: member3.id,
      subscriptionId: subscription2.id,
      canEdit: true, // Carlos can edit
    },
  })

  await prisma.subscriptionMember.create({
    data: {
      userId: member4.id,
      subscriptionId: subscription2.id,
      canEdit: false, // Maria cannot edit
    },
  })

  // Create Sample Items for Subscription 1
  console.log('🛒 Creating sample items for Subscription 1...')
  const item1 = await prisma.item.create({
    data: {
      subscriptionId: subscription1.id,
      name: 'Milk',
      quantity: 2,
      unit: 'liters',
      category: 'Groceries',
      shouldBuy: true,
      currentStock: StockLevel.LOW,
    },
  })

  const item2 = await prisma.item.create({
    data: {
      subscriptionId: subscription1.id,
      name: 'Bread',
      quantity: 1,
      unit: 'loaf',
      category: 'Groceries',
      shouldBuy: true,
      currentStock: StockLevel.MEDIUM,
    },
  })

  const item3 = await prisma.item.create({
    data: {
      subscriptionId: subscription1.id,
      name: 'Laptop',
      quantity: 1,
      unit: 'piece',
      category: 'Electronics',
      shouldBuy: false,
      currentStock: StockLevel.HIGH,
    },
  })

  // Create Sample Items for Subscription 2
  console.log('🛒 Creating sample items for Subscription 2...')
  const item4 = await prisma.item.create({
    data: {
      subscriptionId: subscription2.id,
      name: 'Arroz',
      quantity: 1,
      unit: 'kg',
      category: 'Comida',
      shouldBuy: true,
      currentStock: StockLevel.LOW,
    },
  })

  const item5 = await prisma.item.create({
    data: {
      subscriptionId: subscription2.id,
      name: 'Feijão',
      quantity: 500,
      unit: 'gramas',
      category: 'Comida',
      shouldBuy: true,
      currentStock: StockLevel.MEDIUM,
    },
  })

  const item6 = await prisma.item.create({
    data: {
      subscriptionId: subscription2.id,
      name: 'Smartphone',
      quantity: 1,
      unit: 'piece',
      category: 'Tecnologia',
      shouldBuy: false,
      currentStock: StockLevel.HIGH,
    },
  })

  // Create Sample Prices
  console.log('💰 Creating sample prices...')
  
  // Prices for Milk
  await prisma.itemPrice.createMany({
    data: [
      { itemId: item1.id, price: 3.99, store: 'Walmart' },
      { itemId: item1.id, price: 4.29, store: 'Target' },
      { itemId: item1.id, price: 3.75, store: 'Kroger' },
    ],
  })

  // Prices for Bread
  await prisma.itemPrice.createMany({
    data: [
      { itemId: item2.id, price: 2.50, store: 'Walmart' },
      { itemId: item2.id, price: 2.99, store: 'Target' },
    ],
  })

  // Prices for Laptop
  await prisma.itemPrice.createMany({
    data: [
      { itemId: item3.id, price: 799.99, store: 'Best Buy' },
      { itemId: item3.id, price: 850.00, store: 'Amazon' },
      { itemId: item3.id, price: 775.00, store: 'Newegg' },
    ],
  })

  // Prices for Arroz
  await prisma.itemPrice.createMany({
    data: [
      { itemId: item4.id, price: 5.50, store: 'Carrefour' },
      { itemId: item4.id, price: 6.00, store: 'Pão de Açúcar' },
      { itemId: item4.id, price: 5.25, store: 'Extra' },
    ],
  })

  // Prices for Feijão
  await prisma.itemPrice.createMany({
    data: [
      { itemId: item5.id, price: 4.80, store: 'Carrefour' },
      { itemId: item5.id, price: 5.20, store: 'Pão de Açúcar' },
    ],
  })

  // Prices for Smartphone
  await prisma.itemPrice.createMany({
    data: [
      { itemId: item6.id, price: 1200.00, store: 'Magazine Luiza' },
      { itemId: item6.id, price: 1150.00, store: 'Americanas' },
      { itemId: item6.id, price: 1299.00, store: 'Casas Bahia' },
    ],
  })

  console.log('✅ Seed completed successfully!')
  console.log('\n📊 Summary:')
  console.log('👥 Users created: 6 (2 owners + 4 members)')
  console.log('📋 Subscriptions created: 2')
  console.log('🔗 Memberships created: 4')
  console.log('🛒 Items created: 6')
  console.log('💰 Prices created: 15')
  console.log('\n🔐 Login credentials (all users):')
  console.log('Password: 123123')
  console.log('\n📧 Owner emails:')
  console.log('- john.smith@example.com ($)')
  console.log('- jane.doe@example.com (R$)')
  console.log('\n📧 Member emails:')
  console.log('- alice.johnson@example.com (John\'s subscription, can edit)')
  console.log('- bob.wilson@example.com (John\'s subscription, cannot edit)')
  console.log('- carlos.silva@example.com (Jane\'s subscription, can edit)')
  console.log('- maria.santos@example.com (Jane\'s subscription, cannot edit)')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 