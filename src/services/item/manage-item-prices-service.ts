import prismaClient from '../../prisma'

interface AddPriceRequest {
  itemId: string
  price: number
  store?: string
}

interface UpdatePriceRequest {
  priceId: string
  price?: number
  store?: string
}

class ManageItemPricesService {
  // Add a new price for an item
  async addPrice({ itemId, price, store }: AddPriceRequest) {
    if (!itemId || typeof price !== 'number' || price < 0) {
      throw new Error('Item ID and valid price (>= 0) are required')
    }

    // Verify item exists
    const item = await prismaClient.item.findUnique({
      where: { id: itemId },
    })

    if (!item) {
      throw new Error('Item not found')
    }

    // Check how many prices already exist for this item
    const existingPricesCount = await prismaClient.itemPrice.count({
      where: { itemId },
    })

    if (existingPricesCount >= 3) {
      throw new Error('Maximum of 3 prices allowed per item. Delete an existing price before adding a new one.')
    }

    const newPrice = await prismaClient.itemPrice.create({
      data: {
        itemId,
        price,
        store,
      },
    })

    return newPrice
  }

  // Update an existing price
  async updatePrice({ priceId, price, store }: UpdatePriceRequest) {
    if (!priceId) {
      throw new Error('Price ID is required')
    }

    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      throw new Error('Price must be a non-negative number')
    }

    const hasAtLeastOneField = price !== undefined || store !== undefined

    if (!hasAtLeastOneField) {
      throw new Error('At least one field (price or store) must be provided')
    }

    try {
      const updatedPrice = await prismaClient.itemPrice.update({
        where: { id: priceId },
        data: {
          ...(price !== undefined && { price }),
          ...(store !== undefined && { store }),
        },
      })

      return updatedPrice
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Price record not found')
      }
      throw new Error('An error occurred while updating the price')
    }
  }

  // Delete a price record
  async deletePrice(priceId: string) {
    if (!priceId) {
      throw new Error('Price ID is required')
    }

    try {
      const deletedPrice = await prismaClient.itemPrice.delete({
        where: { id: priceId },
      })

      return deletedPrice
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Price record not found')
      }
      throw new Error('An error occurred while deleting the price')
    }
  }
}

export { ManageItemPricesService } 