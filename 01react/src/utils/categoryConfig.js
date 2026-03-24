// Category configuration with size charts
export const SIZE_CHARTS = {
  // Footwear sizes
  FOOTWEAR: {
    type: 'footwear',
    label: 'Shoe Size (UK)',
    sizes: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'],
    required: true
  },
  
  // Clothing sizes
  CLOTHING: {
    type: 'clothing',
    label: 'Clothing Size',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    required: true
  },
  
  // Kids clothing sizes
  KIDS_CLOTHING: {
    type: 'kids_clothing',
    label: 'Kids Size',
    sizes: ['2-3Y', '3-4Y', '4-5Y', '5-6Y', '6-7Y', '7-8Y', '8-9Y', '9-10Y', '10-11Y', '11-12Y'],
    required: true
  },
  
  // Accessories - one size fits all
  ONE_SIZE: {
    type: 'one_size',
    label: 'Size',
    sizes: ['One Size'],
    required: false
  },
  
  // Watches - wrist sizes
  WATCH: {
    type: 'watch',
    label: 'Wrist Size',
    sizes: ['Small (6-7 inch)', 'Medium (7-8 inch)', 'Large (8-9 inch)'],
    required: false
  },
  
  // Rings
  RING: {
    type: 'ring',
    label: 'Ring Size',
    sizes: ['5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'],
    required: true
  },
  
  // Bags - capacity
  BAG: {
    type: 'bag',
    label: 'Capacity',
    sizes: ['Small (10-15L)', 'Medium (15-25L)', 'Large (25-35L)', 'Extra Large (35L+)'],
    required: false
  }
};

// Category to size chart mapping
export const CATEGORY_SIZE_MAPPING = {
  // Fashion - Men
  'T-Shirts': 'CLOTHING',
  'Shirts': 'CLOTHING',
  'Sweatshirts': 'CLOTHING',
  'Jackets': 'CLOTHING',
  'Sweaters': 'CLOTHING',
  'Co-Ords': 'CLOTHING',
  'Jeans': 'CLOTHING',
  'Trousers': 'CLOTHING',
  'Shorts': 'CLOTHING',
  'Kurtas': 'CLOTHING',
  'Short Kurtas': 'CLOTHING',
  'Kurta Sets': 'CLOTHING',
  'Sherwani': 'CLOTHING',
  'Jackets & Blazers': 'CLOTHING',
  'Dhoti': 'CLOTHING',
  '3-Piece Sets': 'CLOTHING',
  'Track Pants': 'CLOTHING',
  'Tracksuits': 'CLOTHING',
  'Swimwear': 'CLOTHING',
  'Blazers': 'CLOTHING',
  'Boxers': 'CLOTHING',
  'Briefs': 'CLOTHING',
  'Trunks': 'CLOTHING',
  'Vests': 'CLOTHING',
  'Loungewear': 'CLOTHING',
  
  // Fashion - Women
  'Dresses': 'CLOTHING',
  'Tops': 'CLOTHING',
  'Jeans & Bottoms': 'CLOTHING',
  'Tees': 'CLOTHING',
  'Jumpsuits': 'CLOTHING',
  'Sarees': 'ONE_SIZE',
  'Lehengas': 'CLOTHING',
  'Gowns': 'CLOTHING',
  'Indie Wear': 'CLOTHING',
  'Designer Wear': 'CLOTHING',
  'Indie Fusion': 'CLOTHING',
  'Boho Fusion': 'CLOTHING',
  'Street Fusion': 'CLOTHING',
  'Festive Fusion': 'CLOTHING',
  'Contemporary Fusion': 'CLOTHING',
  'Luxury Fusion': 'CLOTHING',
  'Activewear': 'CLOTHING',
  'Gym Wear': 'CLOTHING',
  'Running Wear': 'CLOTHING',
  'Yoga & Athleisure': 'CLOTHING',
  'Bras': 'CLOTHING',
  'Panties': 'CLOTHING',
  'Shapewear': 'CLOTHING',
  'Nightwear': 'CLOTHING',
  'Maternity Wear': 'CLOTHING',
  
  // Footwear
  'Shoes': 'FOOTWEAR',
  'footwear': 'FOOTWEAR',
  'Footwear': 'FOOTWEAR',
  'Casual Shoes': 'FOOTWEAR',
  'Sports Shoes': 'FOOTWEAR',
  'Formal Shoes': 'FOOTWEAR',
  'Sandals & Flip-Flops': 'FOOTWEAR',
  'Heels': 'FOOTWEAR',
  'Flats': 'FOOTWEAR',
  'Sandals': 'FOOTWEAR',
  'Sneakers': 'FOOTWEAR',
  'Boots': 'FOOTWEAR',
  'Loafers': 'FOOTWEAR',
  'Oxford Shoes': 'FOOTWEAR',
  'Derby Shoes': 'FOOTWEAR',
  'Slip-Ons': 'FOOTWEAR',
  'Mules': 'FOOTWEAR',
  'Wedges': 'FOOTWEAR',
  'Ankle Boots': 'FOOTWEAR',
  'Running Shoes': 'FOOTWEAR',
  'Training Shoes': 'FOOTWEAR',
  'Basketball Shoes': 'FOOTWEAR',
  'Football Shoes': 'FOOTWEAR',
  'Cricket Shoes': 'FOOTWEAR',
  'Flip-Flops': 'FOOTWEAR',
  'Slippers': 'FOOTWEAR',
  'Men Footwear': 'FOOTWEAR',
  'Women Footwear': 'FOOTWEAR',
  'Kids Footwear': 'FOOTWEAR',
  'Men\'s Footwear': 'FOOTWEAR',
  'Women\'s Footwear': 'FOOTWEAR',
  
  // Accessories
  'Bags & Backpacks': 'BAG',
  'Wallets & Belts': 'ONE_SIZE',
  'Watches': 'WATCH',
  'Sunglasses & Eyewear': 'ONE_SIZE',
  'Jewellery': 'ONE_SIZE',
  'Hair Accessories': 'ONE_SIZE',
  'Caps & Hats': 'ONE_SIZE',
  'Scarves & Stoles': 'ONE_SIZE',
  
  // Beauty - no sizes needed
  'Skincare': null,
  'Haircare': null,
  'Makeup': null,
  'Personal Care': null,
  'Grooming': null,
  'Fragrances': null,
  'Beauty Tools & Appliances': null,
  
  // Home & Living - no sizes needed
  'Kitchenware': null,
  'Dining Essentials': null,
  'Storage & Organizers': null,
  'Cleaning & Utility': null,
  'Bedding & Linen': null,
  'Bathroom Accessories': null,
  'Home Improvement': null,
  
  // Gadgets - no sizes needed
  'Mobile Accessories': null,
  'Audio Devices': null,
  'Smart Devices': null,
  'Computer Accessories': null,
  'Gaming Accessories': null,
  'Chargers & Power Banks': null,
  
  // Electrical Appliances - no sizes needed
  'Large Appliances': null,
  'Small Appliances': null,
  'Kitchen Appliances': null,
  'Heating & Cooling': null,
  'Personal Appliances': null
};

// Helper function to get size chart for a category
export const getSizeChartForCategory = (categoryName) => {
  if (!categoryName) return null;
  // Direct match first
  const sizeChartKey = CATEGORY_SIZE_MAPPING[categoryName];
  if (sizeChartKey !== undefined) {
    return sizeChartKey ? SIZE_CHARTS[sizeChartKey] : null;
  }
  // Case-insensitive fallback
  const lower = categoryName.toLowerCase();
  const matchedKey = Object.keys(CATEGORY_SIZE_MAPPING).find(
    k => k.toLowerCase() === lower
  );
  if (matchedKey !== undefined) {
    const key = CATEGORY_SIZE_MAPPING[matchedKey];
    return key ? SIZE_CHARTS[key] : null;
  }
  // Keyword fallback for footwear
  if (lower.includes('shoe') || lower.includes('boot') || lower.includes('sneaker') ||
      lower.includes('footwear') || lower.includes('sandal') || lower.includes('heel') ||
      lower.includes('loafer') || lower.includes('slipper') || lower.includes('flat')) {
    return SIZE_CHARTS['FOOTWEAR'];
  }
  return null;
};

// Helper function to check if category needs size selection
export const categoryNeedsSize = (categoryName) => {
  return getSizeChartForCategory(categoryName) !== null;
};
