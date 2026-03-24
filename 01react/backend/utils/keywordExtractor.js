/**
 * Keyword Extraction Utility
 * Extracts searchable keywords and attributes from product descriptions
 */

// Common materials
const MATERIALS = [
  'cotton', 'polyester', 'silk', 'wool', 'linen', 'denim', 'leather',
  'suede', 'velvet', 'satin', 'chiffon', 'nylon', 'spandex', 'lycra',
  'rayon', 'acrylic', 'cashmere', 'fleece', 'canvas', 'corduroy'
];

// Fit types
const FITS = [
  'slim fit', 'regular fit', 'loose fit', 'relaxed fit', 'oversized',
  'tight fit', 'skinny', 'straight fit', 'bootcut', 'tapered',
  'athletic fit', 'classic fit', 'modern fit', 'comfort fit'
];

// Seasons
const SEASONS = [
  'summer', 'winter', 'spring', 'autumn', 'fall', 'all season',
  'monsoon', 'rainy', 'seasonal'
];

// Occasions
const OCCASIONS = [
  'casual', 'formal', 'party', 'wedding', 'office', 'work',
  'sports', 'gym', 'running', 'yoga', 'beach', 'travel',
  'festive', 'ethnic', 'traditional', 'western', 'indo-western',
  'brunch', 'dinner', 'date', 'weekend', 'everyday'
];

// Styles
const STYLES = [
  'vintage', 'modern', 'classic', 'trendy', 'bohemian', 'minimalist',
  'elegant', 'chic', 'sporty', 'edgy', 'preppy', 'streetwear',
  'athleisure', 'smart casual', 'business casual'
];

// Colors (common ones)
const COLORS = [
  'black', 'white', 'red', 'blue', 'green', 'yellow', 'orange',
  'pink', 'purple', 'brown', 'grey', 'gray', 'beige', 'navy',
  'maroon', 'olive', 'teal', 'turquoise', 'lavender', 'cream',
  'ivory', 'gold', 'silver', 'bronze'
];

// Patterns
const PATTERNS = [
  'solid', 'striped', 'checked', 'plaid', 'floral', 'printed',
  'embroidered', 'plain', 'polka dot', 'geometric', 'abstract',
  'paisley', 'animal print', 'tie-dye', 'ombre'
];

/**
 * Extract keywords from product description
 * @param {string} text - Product name and description
 * @param {string} categoryName - Product category
 * @returns {object} Extracted attributes
 */
export function extractKeywords(text, categoryName = '') {
  if (!text) return {};

  const lowerText = (text + ' ' + categoryName).toLowerCase();
  const extracted = {
    materials: [],
    fits: [],
    seasons: [],
    occasions: [],
    styles: [],
    colors: [],
    patterns: [],
    keywords: []
  };

  // Extract materials
  MATERIALS.forEach(material => {
    if (lowerText.includes(material)) {
      extracted.materials.push(material);
    }
  });

  // Extract fits
  FITS.forEach(fit => {
    if (lowerText.includes(fit)) {
      extracted.fits.push(fit);
    }
  });

  // Extract seasons
  SEASONS.forEach(season => {
    if (lowerText.includes(season)) {
      extracted.seasons.push(season);
    }
  });

  // Extract occasions
  OCCASIONS.forEach(occasion => {
    if (lowerText.includes(occasion)) {
      extracted.occasions.push(occasion);
    }
  });

  // Extract styles
  STYLES.forEach(style => {
    if (lowerText.includes(style)) {
      extracted.styles.push(style);
    }
  });

  // Extract colors
  COLORS.forEach(color => {
    if (lowerText.includes(color)) {
      extracted.colors.push(color);
    }
  });

  // Extract patterns
  PATTERNS.forEach(pattern => {
    if (lowerText.includes(pattern)) {
      extracted.patterns.push(pattern);
    }
  });

  // Extract general keywords (words longer than 3 characters)
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  // Remove duplicates and common stop words
  const stopWords = ['this', 'that', 'with', 'from', 'have', 'been', 'were', 'their', 'what', 'about'];
  extracted.keywords = [...new Set(words)]
    .filter(word => !stopWords.includes(word))
    .slice(0, 20); // Limit to 20 keywords

  return extracted;
}

/**
 * Generate search tags from extracted keywords
 * @param {object} extracted - Extracted keywords object
 * @returns {array} Array of search tags
 */
export function generateSearchTags(extracted) {
  const tags = [];
  
  Object.values(extracted).forEach(arr => {
    if (Array.isArray(arr)) {
      tags.push(...arr);
    }
  });

  return [...new Set(tags)]; // Remove duplicates
}

/**
 * Build full-text search vector
 * @param {string} productName - Product name
 * @param {string} description - Product description
 * @param {array} tags - Search tags
 * @returns {string} Search vector for PostgreSQL
 */
export function buildSearchVector(productName, description, tags) {
  const allText = [
    productName,
    description,
    ...tags
  ].filter(Boolean).join(' ');

  return allText.toLowerCase();
}

export default {
  extractKeywords,
  generateSearchTags,
  buildSearchVector
};
