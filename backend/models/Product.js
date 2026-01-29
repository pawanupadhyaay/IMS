const Joi = require("joi");
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    brand: {
      type: String,
      trim: true,
      default: "",
    },
    sku: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      trim: true,
      default: "",
    },
    inventory: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    metafields: {
      caseMaterial: {
        type: String,
        default: "",
      },
      dialColor: {
        type: String,
        default: "",
      },
      waterResistance: {
        type: String,
        default: "",
      },
      warrantyPeriod: {
        type: String,
        default: "",
      },
      movement: {
        type: String,
        default: "",
      },
      gender: {
        type: String,
        default: "",
      },
      caseSize: {
        type: String,
        default: "",
      },
    },
    images: {
      type: [String],
      default: [],
    },
    image: {
      url: {
        type: String,
        default: "",
      },
      altText: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create optimized indexes for performance at scale (10k-100k+ products)
// Unique index on SKU (sparse - allows null/empty but unique values)
productSchema.index({ sku: 1 }, { unique: true, sparse: true });

// Single field indexes for filtering
productSchema.index({ brand: 1 });
productSchema.index({ category: 1 });
productSchema.index({ inventory: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

// Compound indexes for common query patterns
productSchema.index({ brand: 1, createdAt: -1 });
productSchema.index({ category: 1, inventory: 1 });
productSchema.index({ brand: 1, category: 1 });

// Text index for search (if needed for full-text search)
// productSchema.index({ brand: 'text', sku: 'text', category: 'text', description: 'text' });

const Product = mongoose.model("Product", productSchema);

function validateProduct(product) {
  const schema = Joi.object({
    user: Joi.string().optional(),
    brand: Joi.string().allow("").optional(),
    sku: Joi.string().allow("").optional(),
    category: Joi.string().allow("").optional(),
    inventory: Joi.number().optional(),
    price: Joi.number().optional(),
    description: Joi.string().allow("").optional(),
    images: Joi.array().items(Joi.string().allow("")).optional(),
    metafields: Joi.object({
      caseMaterial: Joi.string().allow("").optional(),
      dialColor: Joi.string().allow("").optional(),
      waterResistance: Joi.string().allow("").optional(),
      warrantyPeriod: Joi.string().allow("").optional(),
      movement: Joi.string().allow("").optional(),
      gender: Joi.string().allow("").optional(),
      caseSize: Joi.string().allow("").optional(),
    }).optional(),
  });

  return schema.validate(product);
}

module.exports.Product = Product;
module.exports.validateProduct = validateProduct;

