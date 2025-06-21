import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

interface UnitResult {
  id: string;
  name: string;
  subscriptionId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface BulkCreateResult {
  created: number;
  existing: number;
}

/**
 * Find or create a unit within a subscription
 * @param subscriptionId - The subscription ID
 * @param unitName - The unit name (will be normalized to lowercase)
 * @returns The unit object
 */
export async function findOrCreateUnit(subscriptionId: string, unitName: string): Promise<UnitResult> {
  const normalizedName = unitName.toLowerCase().trim();
  
  if (!normalizedName) {
    throw new Error('Unit name cannot be empty');
  }

  // Try to find existing unit (case-insensitive)
  let unit = await prisma.unit.findFirst({
    where: {
      subscriptionId,
      name: normalizedName
    }
  });

  // Create if doesn't exist
  if (!unit) {
    unit = await prisma.unit.create({
      data: {
        name: normalizedName,
        subscriptionId
      }
    });
  }

  return unit;
}

/**
 * Get all units for a subscription
 * @param subscriptionId - The subscription ID
 * @returns Array of units
 */
export async function getUnits(subscriptionId: string) {
  return prisma.unit.findMany({
    where: { subscriptionId },
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { items: true }
      }
    }
  });
}

/**
 * Create a new unit
 * @param subscriptionId - The subscription ID
 * @param unitName - The unit name
 * @returns The created unit
 */
export async function createUnit(subscriptionId: string, unitName: string): Promise<UnitResult> {
  const normalizedName = unitName.toLowerCase().trim();
  
  if (!normalizedName) {
    throw new Error('Unit name cannot be empty');
  }

  // Check if unit already exists
  const existing = await prisma.unit.findFirst({
    where: {
      subscriptionId,
      name: normalizedName
    }
  });

  if (existing) {
    throw new Error('Unit already exists');
  }

  return prisma.unit.create({
    data: {
      name: normalizedName,
      subscriptionId
    }
  });
}

/**
 * Update a unit
 * @param unitId - The unit ID
 * @param newName - The new unit name
 * @param subscriptionId - The subscription ID (for validation)
 * @returns The updated unit
 */
export async function updateUnit(unitId: string, newName: string, subscriptionId: string): Promise<UnitResult> {
  const normalizedName = newName.toLowerCase().trim();
  
  if (!normalizedName) {
    throw new Error('Unit name cannot be empty');
  }

  // Validate unit belongs to subscription
  await validateUnitAccess(subscriptionId, unitId);

  // Check if new name conflicts with existing unit
  const existing = await prisma.unit.findFirst({
    where: {
      subscriptionId,
      name: normalizedName,
      NOT: { id: unitId }
    }
  });

  if (existing) {
    throw new Error('Unit name already exists');
  }

  return prisma.unit.update({
    where: { id: unitId },
    data: { name: normalizedName }
  });
}

/**
 * Delete a unit (sets items' unitId to null)
 * @param unitId - The unit ID
 * @param subscriptionId - The subscription ID (for validation)
 * @returns Deletion result with affected items count
 */
export async function deleteUnit(unitId: string, subscriptionId: string): Promise<{ deletedUnit: string; affectedItems: number }> {
  // Validate unit belongs to subscription
  await validateUnitAccess(subscriptionId, unitId);

  return prisma.$transaction(async (prisma) => {
    // Count items that will be affected
    const itemCount = await prisma.item.count({
      where: { unitId }
    });

    // Delete unit (foreign key constraint will set items.unitId to null)
    await prisma.unit.delete({
      where: { id: unitId }
    });

    return { deletedUnit: unitId, affectedItems: itemCount };
  });
}

/**
 * Validate that a unit belongs to the specified subscription
 * @param subscriptionId - The subscription ID
 * @param unitId - The unit ID
 * @throws Error if unit doesn't exist or doesn't belong to subscription
 */
export async function validateUnitAccess(subscriptionId: string, unitId: string): Promise<UnitResult> {
  const unit = await prisma.unit.findUnique({
    where: { id: unitId }
  });

  if (!unit) {
    throw new Error('Unit not found');
  }

  if (unit.subscriptionId !== subscriptionId) {
    throw new Error('Unit does not belong to this subscription');
  }

  return unit;
}

/**
 * Clean up orphaned units (not referenced by any items)
 * @param subscriptionId - The subscription ID
 * @returns Number of units cleaned up
 */
export async function cleanupOrphanedUnits(subscriptionId: string): Promise<number> {
  const orphanedUnits = await prisma.unit.findMany({
    where: {
      subscriptionId,
      items: { none: {} }
    }
  });

  if (orphanedUnits.length > 0) {
    await prisma.unit.deleteMany({
      where: {
        id: { in: orphanedUnits.map(u => u.id) }
      }
    });
  }

  return orphanedUnits.length;
}

/**
 * Bulk create units
 * @param subscriptionId - The subscription ID
 * @param unitNames - Array of unit names
 * @returns Result with created and existing counts
 */
export async function bulkCreateUnits(subscriptionId: string, unitNames: string[]): Promise<BulkCreateResult> {
  const normalizedNames = unitNames
    .map(name => name.toLowerCase().trim())
    .filter(name => name.length > 0);

  if (normalizedNames.length === 0) {
    return { created: 0, existing: 0 };
  }

  // Get existing units
  const existing = await prisma.unit.findMany({
    where: {
      subscriptionId,
      name: { in: normalizedNames }
    }
  });

  const existingNames = existing.map(u => u.name);
  const newNames = normalizedNames.filter(name => !existingNames.includes(name));

  // Create new units
  if (newNames.length > 0) {
    await prisma.unit.createMany({
      data: newNames.map(name => ({
        name,
        subscriptionId
      }))
    });
  }

  return { created: newNames.length, existing: existingNames.length };
} 