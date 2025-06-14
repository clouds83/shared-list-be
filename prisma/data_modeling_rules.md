# Data Modeling Rules and Guidelines

## Core Business Rules

### User-Subscription Relationship
- **One User = One Subscription**: Each user can only belong to ONE subscription at a time
- **User can be**: Either an owner OR a member, never both
- **Subscription Owner**: The primary account holder who created the subscription
- **Subscription Members**: Secondary users who have access to the subscription
- **Member Editing Rights**: Members can be granted edit permissions via the `canEdit` field
- **Ownership Transfer**: Not currently supported (would require special migration logic)

### Subscription Structure
- **One Owner per Subscription**: Each subscription has exactly one owner (1:1 relationship)
- **Multiple Members Allowed**: A subscription can have unlimited members
- **Owner Uniqueness**: A user who owns a subscription cannot be a member of another subscription
- **Member Uniqueness**: A user who is a member cannot own or be a member of another subscription
- **Member Permissions**: By default, members cannot edit (canEdit = false), but owners can grant edit rights

## Database Design Principles

### 1. Relationship Constraints
```prisma
// ✅ Correct: One-to-one owner relationship
ownerId String @unique

// ✅ Correct: Each user can only be a member once
userId String @unique // in SubscriptionMember table

// ✅ Correct: Member edit permissions
canEdit Boolean @default(false) // Allow member to edit the list
```

### 2. Simple Item Management
- **Boolean Status**: Use `shouldBuy` boolean for simplicity
- **Hard Deletes**: Items are permanently removed when deleted
- **No Ordering**: Items displayed in creation order or alphabetically
- **No Audit Trail**: Keep data model simple without tracking who created items
- **Stock Tracking**: Optional `currentStock` field with LOW/MEDIUM/HIGH levels
- **Default Values**: Quantity defaults to 1, category defaults to "Uncategorized"

### 3. Currency Handling
- **Symbol Storage**: `currencySymbol` stores display symbols like "$", "R$", "€"
- **Subscription Level**: All prices within a subscription use the same currency symbol
- **No Price Currency**: ItemPrice table doesn't store currency (inherits from subscription)
- **String Validation**: Currency symbol limited to 10 characters for database efficiency

### 4. Data Validation & String Constraints
- **String Length Limits**: All string fields have appropriate @db.VarChar constraints
  - User emails: 100 characters
  - User names: 50 characters  
  - Passwords: 72 characters (for hashed values)
  - Item names: 50 characters
  - Categories: 50 characters
  - Units: 20 characters
  - Store names: 50 characters
  - Currency symbols: 5 characters
- **Check Constraints**: While not natively supported in Prisma schema, database-level constraints can be added via raw SQL for:
  - Non-negative prices (price >= 0)
  - Non-negative quantities (quantity >= 0)

## Performance Optimization Rules

### 1. Strategic Indexing
```prisma
// ✅ Always index foreign keys
@@index([subscriptionId])

// ✅ Compound indexes for common query patterns
@@index([subscriptionId, shouldBuy]) // Filter by needed/not needed items
@@index([subscriptionId, category]) // Category filtering
@@index([subscriptionId, createdAt]) // Chronological ordering
@@index([subscriptionId, updatedAt]) // Recently modified items
```

### 2. Category Management
- **Storage**: Array field `categories` in Subscription table
- **Benefits**: Lightning-fast autocomplete, no complex joins
- **Maintenance**: Sync categories when items are created/updated
- **Trade-off**: Slight data duplication for major performance gain
- **Default Handling**: Items with no category get "Uncategorized" as default

### 3. Simple Currency Display
- **Subscription Level**: `currencySymbol` field stores display symbol
- **Frontend Usage**: Append/prepend symbol to price display
- **Examples**: "$", "R$", "€", "£", "¥"
- **Validation**: Limited to 10 characters to prevent excessive storage

### 4. Stock Level Management
- **Enum Values**: LOW, MEDIUM, HIGH for simple categorization
- **Nullable Field**: Stock level is optional (can be null)
- **Simple Logic**: Easy to implement UI indicators and filtering

## Data Integrity Rules

### 1. Cascade Delete Strategy
```prisma
// ✅ Proper cascade relationships
owner User @relation("SubscriptionOwner", fields: [ownerId], references: [id], onDelete: Cascade)
```

- **User Deleted**: Remove their owned subscription and membership
- **Subscription Deleted**: Remove all items, prices, and memberships
- **Item Deleted**: Remove all associated prices (hard delete)

### 2. Required vs Optional Fields
```prisma
// ✅ Required business fields
name String @db.VarChar(200) // Item name always required, length limited
subscriptionId String // Items must belong to subscription
shouldBuy Boolean @default(true) // Simple boolean status

// ✅ Optional user fields with defaults
quantity Int? @default(1) // Defaults to 1, but can be null
unit String? @db.VarChar(50) // Unit is optional but length limited
category String? @default("Uncategorized") @db.VarChar(100) // Default category provided
currentStock StockLevel? // Stock level is completely optional
```

### 3. Default Values
- **Simple Defaults**: `shouldBuy: true`, `isActive: true`, `canEdit: false`
- **Timestamp Defaults**: `createdAt: now()`, `updatedAt: @updatedAt`
- **Currency Default**: `currencySymbol: "$"`
- **Item Defaults**: `quantity: 1`, `category: "Uncategorized"`

### 4. String Validation Best Practices
- **Consistent Limits**: All string fields have appropriate length constraints
- **Database Efficiency**: VarChar constraints improve performance and storage
- **User Experience**: Prevents form submission errors by defining clear limits
- **Security**: Helps prevent potential buffer overflow or excessive data attacks

## Member Permission System

### 1. Edit Permissions
```prisma
// ✅ Member edit control
canEdit Boolean @default(false) // Members cannot edit by default
```

- **Default Behavior**: New members cannot edit lists (canEdit = false)
- **Owner Control**: Subscription owners can grant/revoke edit permissions
- **Granular Control**: Permission system ready for future expansion

### 2. Permission Levels
- **Owner**: Full control (create, read, update, delete all data)
- **Member with Edit**: Can modify items but not subscription settings
- **Member without Edit**: Read-only access to lists
- **Future Enhancement**: Role-based permissions can be added later

## Scalability Considerations

### 1. Large Dataset Handling
- **Pagination Ready**: All major queries should support cursor-based pagination
- **Efficient Indexes**: Compound indexes for common filter combinations
- **Archive Strategy**: Plan for moving old price data to archive tables
- **String Optimization**: VarChar constraints reduce storage overhead

### 2. Query Patterns
```typescript
// ✅ Efficient: Use compound indexes
const neededItems = await prisma.item.findMany({
  where: { 
    subscriptionId: "sub-id", 
    shouldBuy: true
  }
  // Uses index: [subscriptionId, shouldBuy]
});

// ✅ Efficient: Category autocomplete with default handling
const categories = await prisma.subscription.findUnique({
  where: { id: subscriptionId },
  select: { categories: true }
});

// ✅ Efficient: Stock level filtering
const lowStockItems = await prisma.item.findMany({
  where: {
    subscriptionId: "sub-id",
    currentStock: "LOW"
  }
});
```

### 3. Future Partitioning Readiness
- **Partition Key Ready**: `subscriptionId` can be used for horizontal partitioning
- **Date Partitioning**: `ItemPrice` can be partitioned by `createdAt` for archival

## Security and Access Control

### 1. User Access Validation
```typescript
// ✅ Always validate subscription access with edit permissions
async function hasEditAccess(userId: string, subscriptionId: string) {
  const access = await prisma.subscription.findFirst({
    where: {
      id: subscriptionId,
      OR: [
        { ownerId: userId }, // User is owner (always has edit access)
        { 
          members: { 
            some: { 
              userId, 
              isActive: true, 
              canEdit: true // Member must have edit permission
            } 
          } 
        }
      ]
    }
  });
  return !!access;
}

// ✅ Read access validation
async function hasReadAccess(userId: string, subscriptionId: string) {
  const access = await prisma.subscription.findFirst({
    where: {
      id: subscriptionId,
      OR: [
        { ownerId: userId }, // User is owner
        { members: { some: { userId, isActive: true } } } // User is active member
      ]
    }
  });
  return !!access;
}
```

### 2. Data Isolation
- **Subscription Boundary**: All item operations must validate subscription access
- **User Isolation**: Users can only see data from their subscription
- **Permission Boundaries**: Edit operations require additional permission validation
- **Simple Security**: No complex audit trails or soft delete considerations

### 3. Input Validation
- **String Length**: Database constraints prevent oversized inputs
- **Type Safety**: Enums ensure valid stock levels
- **Default Values**: Reduce null-related errors and improve UX

## Migration and Maintenance Rules

### 1. Schema Changes
- **Additive Changes**: Prefer adding optional fields over modifying existing ones
- **Simple Structure**: Avoid complex enums or status tracking beyond current StockLevel
- **Index Additions**: Can be added without breaking changes
- **String Constraints**: Can be made more restrictive but not more permissive without data migration

### 2. Data Cleanup
```typescript
// ✅ Regular maintenance tasks
// 1. Sync subscription categories with actual item categories (handle "Uncategorized" properly)
// 2. Archive old price data (older than 1 year)
// 3. Remove inactive memberships (inactive > 6 months)
// 4. Validate string lengths match database constraints

// ✅ Category synchronization with default handling
const syncCategories = async (subscriptionId: string) => {
  const items = await prisma.item.findMany({
    where: { subscriptionId },
    select: { category: true }
  });
  
  const uniqueCategories = [...new Set(
    items
      .map(item => item.category)
      .filter(cat => cat && cat !== "Uncategorized") // Exclude default category
  )];
  
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { categories: uniqueCategories }
  });
};
```

### 3. Backup Considerations
- **Critical Tables**: User, Subscription, SubscriptionMember (structure and permissions)
- **Bulk Data**: Item, ItemPrice (can be large, consider partial backups)
- **Recovery Priority**: User access > Permissions > Item data > Price history

## Development Guidelines

### 1. Naming Conventions
- **Tables**: Plural, snake_case (`subscription_members`)
- **Fields**: camelCase (`subscriptionId`, `shouldBuy`, `canEdit`, `currentStock`)
- **Relations**: Descriptive names (`ownedSubscription`, `membershipSubscription`)
- **Currency**: `currencySymbol` for display symbols
- **Enums**: PascalCase values (`LOW`, `MEDIUM`, `HIGH`)

### 2. Error Handling Patterns
- **Unique Constraints**: Handle gracefully (user already in subscription)
- **Foreign Key Violations**: Validate access before operations
- **Cascade Effects**: Inform users about related deletions
- **String Length Violations**: Provide clear error messages with character limits
- **Permission Violations**: Distinguish between read and edit access errors

### 3. Testing Considerations
- **Relationship Tests**: Verify one-user-one-subscription constraint
- **Performance Tests**: Test with large datasets (1M+ items)
- **Cascade Tests**: Verify proper cleanup on deletions
- **Access Control Tests**: Verify users can't access other subscriptions
- **Permission Tests**: Test edit permission enforcement
- **String Validation Tests**: Test length constraints and default values
- **Stock Level Tests**: Test enum validation and null handling

## Common Query Patterns

### Subscription Access with Permissions
```typescript
// Get user's subscription (owner or member)
const getUserSubscription = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      ownedSubscription: true,
      membershipSubscription: { 
        include: { 
          subscription: true 
        } 
      }
    }
  });
  
  return user?.ownedSubscription || user?.membershipSubscription?.subscription;
};

// Check if user can edit subscription
const canUserEdit = async (userId: string, subscriptionId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      ownedSubscription: { where: { id: subscriptionId } },
      membershipSubscription: { 
        where: { 
          subscriptionId,
          isActive: true,
          canEdit: true 
        }
      }
    }
  });
  
  return !!(user?.ownedSubscription || user?.membershipSubscription);
};
```

### Item Management with Defaults and Stock
```typescript
// Get items with filtering including stock levels
const getItems = async (
  subscriptionId: string, 
  filters?: { 
    shouldBuy?: boolean, 
    category?: string,
    stockLevel?: StockLevel 
  }
) => {
  return prisma.item.findMany({
    where: {
      subscriptionId,
      ...(filters?.shouldBuy !== undefined && { shouldBuy: filters.shouldBuy }),
      ...(filters?.category && { category: filters.category }),
      ...(filters?.stockLevel && { currentStock: filters.stockLevel })
    },
    orderBy: { createdAt: 'desc' }
  });
};

// Create item with proper defaults
const createItem = async (itemData: {
  subscriptionId: string;
  name: string;
  quantity?: number; // Will default to 1
  category?: string; // Will default to "Uncategorized"
  unit?: string;
  currentStock?: StockLevel;
}) => {
  return prisma.item.create({
    data: {
      ...itemData,
      // Defaults are handled by schema, but can be explicit:
      quantity: itemData.quantity ?? 1,
      category: itemData.category ?? "Uncategorized"
    }
  });
};

// Display price with currency symbol
const displayPrice = (price: number, currencySymbol: string) => {
  return `${currencySymbol}${price.toFixed(2)}`;
};
```

### Category Management with Defaults
```typescript
// Add category to subscription when creating item (excluding defaults)
const createItemWithCategory = async (itemData: CreateItemData) => {
  const item = await prisma.item.create({ data: itemData });
  
  // Only sync non-default categories
  if (itemData.category && itemData.category !== "Uncategorized") {
    const subscription = await prisma.subscription.findUnique({
      where: { id: itemData.subscriptionId },
      select: { categories: true }
    });
    
    if (subscription && !subscription.categories.includes(itemData.category)) {
      await prisma.subscription.update({
        where: { id: itemData.subscriptionId },
        data: {
          categories: [...subscription.categories, itemData.category]
        }
      });
    }
  }
  
  return item;
};

// Get categories for autocomplete (excluding default)
const getCategories = async (subscriptionId: string) => {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    select: { categories: true }
  });
  
  return subscription?.categories || [];
};
```

### Stock Level Management
```typescript
// Update stock levels
const updateStockLevel = async (itemId: string, stockLevel: StockLevel | null) => {
  return prisma.item.update({
    where: { id: itemId },
    data: { currentStock: stockLevel }
  });
};

// Get items by stock level
const getItemsByStockLevel = async (subscriptionId: string, stockLevel: StockLevel) => {
  return prisma.item.findMany({
    where: {
      subscriptionId,
      currentStock: stockLevel
    }
  });
};

// Get low stock items
const getLowStockItems = async (subscriptionId: string) => {
  return prisma.item.findMany({
    where: {
      subscriptionId,
      currentStock: "LOW"
    }
  });
};
```

### Member Permission Management
```typescript
// Grant edit permission to member
const grantEditPermission = async (userId: string, subscriptionId: string) => {
  return prisma.subscriptionMember.update({
    where: {
      userId // unique constraint ensures one membership per user
    },
    data: {
      canEdit: true
    }
  });
};

// Revoke edit permission from member
const revokeEditPermission = async (userId: string) => {
  return prisma.subscriptionMember.update({
    where: { userId },
    data: { canEdit: false }
  });
};

// Get all members with their permissions
const getSubscriptionMembers = async (subscriptionId: string) => {
  return prisma.subscriptionMember.findMany({
    where: { subscriptionId, isActive: true },
    include: { user: true },
    select: {
      id: true,
      canEdit: true,
      joinedAt: true,
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });
};
```

This enhanced data model provides a solid foundation for your shopping list application with proper validation, permissions, defaults, and scalability considerations. The combination of database constraints, sensible defaults, and permission controls ensures data integrity while maintaining performance and user experience.