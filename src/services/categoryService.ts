import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

interface CategoryResult {
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
 * Find or create a category within a subscription
 * @param subscriptionId - The subscription ID
 * @param categoryName - The category name (will be normalized to lowercase)
 * @returns The category object
 */
export async function findOrCreateCategory(subscriptionId: string, categoryName: string): Promise<CategoryResult> {
  const normalizedName = categoryName.toLowerCase().trim();
  
  if (!normalizedName) {
    throw new Error('Category name cannot be empty');
  }

  // Try to find existing category (case-insensitive)
  let category = await prisma.category.findFirst({
    where: {
      subscriptionId,
      name: normalizedName
    }
  });

  // Create if doesn't exist
  if (!category) {
    category = await prisma.category.create({
      data: {
        name: normalizedName,
        subscriptionId
      }
    });
  }

  return category;
}

/**
 * Get all categories for a subscription
 * @param subscriptionId - The subscription ID
 * @returns Array of categories
 */
export async function getCategories(subscriptionId: string) {
  return prisma.category.findMany({
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
 * Create a new category
 * @param subscriptionId - The subscription ID
 * @param categoryName - The category name
 * @returns The created category
 */
export async function createCategory(subscriptionId: string, categoryName: string): Promise<CategoryResult> {
  const normalizedName = categoryName.toLowerCase().trim();
  
  if (!normalizedName) {
    throw new Error('Category name cannot be empty');
  }

  // Check if category already exists
  const existing = await prisma.category.findFirst({
    where: {
      subscriptionId,
      name: normalizedName
    }
  });

  if (existing) {
    throw new Error('Category already exists');
  }

  return prisma.category.create({
    data: {
      name: normalizedName,
      subscriptionId
    }
  });
}

/**
 * Update a category
 * @param categoryId - The category ID
 * @param newName - The new category name
 * @param subscriptionId - The subscription ID (for validation)
 * @returns The updated category
 */
export async function updateCategory(categoryId: string, newName: string, subscriptionId: string): Promise<CategoryResult> {
  const normalizedName = newName.toLowerCase().trim();
  
  if (!normalizedName) {
    throw new Error('Category name cannot be empty');
  }

  // Validate category belongs to subscription
  await validateCategoryAccess(subscriptionId, categoryId);

  // Check if new name conflicts with existing category
  const existing = await prisma.category.findFirst({
    where: {
      subscriptionId,
      name: normalizedName,
      NOT: { id: categoryId }
    }
  });

  if (existing) {
    throw new Error('Category name already exists');
  }

  return prisma.category.update({
    where: { id: categoryId },
    data: { name: normalizedName }
  });
}

/**
 * Delete a category (sets items' categoryId to null)
 * @param categoryId - The category ID
 * @param subscriptionId - The subscription ID (for validation)
 * @returns Deletion result with affected items count
 */
export async function deleteCategory(categoryId: string, subscriptionId: string): Promise<{ deletedCategory: string; affectedItems: number }> {
  // Validate category belongs to subscription
  await validateCategoryAccess(subscriptionId, categoryId);

  return prisma.$transaction(async (prisma) => {
    // Count items that will be affected
    const itemCount = await prisma.item.count({
      where: { categoryId }
    });

    // Delete category (foreign key constraint will set items.categoryId to null)
    await prisma.category.delete({
      where: { id: categoryId }
    });

    return { deletedCategory: categoryId, affectedItems: itemCount };
  });
}

/**
 * Validate that a category belongs to the specified subscription
 * @param subscriptionId - The subscription ID
 * @param categoryId - The category ID
 * @throws Error if category doesn't exist or doesn't belong to subscription
 */
export async function validateCategoryAccess(subscriptionId: string, categoryId: string): Promise<CategoryResult> {
  const category = await prisma.category.findUnique({
    where: { id: categoryId }
  });

  if (!category) {
    throw new Error('Category not found');
  }

  if (category.subscriptionId !== subscriptionId) {
    throw new Error('Category does not belong to this subscription');
  }

  return category;
}

/**
 * Clean up orphaned categories (not referenced by any items)
 * @param subscriptionId - The subscription ID
 * @returns Number of categories cleaned up
 */
export async function cleanupOrphanedCategories(subscriptionId: string): Promise<number> {
  const orphanedCategories = await prisma.category.findMany({
    where: {
      subscriptionId,
      items: { none: {} }
    }
  });

  if (orphanedCategories.length > 0) {
    await prisma.category.deleteMany({
      where: {
        id: { in: orphanedCategories.map(c => c.id) }
      }
    });
  }

  return orphanedCategories.length;
}

/**
 * Bulk create categories
 * @param subscriptionId - The subscription ID
 * @param categoryNames - Array of category names
 * @returns Result with created and existing counts
 */
export async function bulkCreateCategories(subscriptionId: string, categoryNames: string[]): Promise<BulkCreateResult> {
  const normalizedNames = categoryNames
    .map(name => name.toLowerCase().trim())
    .filter(name => name.length > 0);

  if (normalizedNames.length === 0) {
    return { created: 0, existing: 0 };
  }

  // Get existing categories
  const existing = await prisma.category.findMany({
    where: {
      subscriptionId,
      name: { in: normalizedNames }
    }
  });

  const existingNames = existing.map(c => c.name);
  const newNames = normalizedNames.filter(name => !existingNames.includes(name));

  // Create new categories
  if (newNames.length > 0) {
    await prisma.category.createMany({
      data: newNames.map(name => ({
        name,
        subscriptionId
      }))
    });
  }

  return { created: newNames.length, existing: existingNames.length };
} 