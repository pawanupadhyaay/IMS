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
      type: [
        {
          url: {
            type: String,
            default: "",
          },
          altText: {
            type: String,
            default: "",
          },
        },
      ],
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

const Product = mongoose.model("Product", productSchema);

// Create indexes for better query performance
Product.collection.createIndex({ brand: 1 });
Product.collection.createIndex({ category: 1 });
Product.collection.createIndex({ createdAt: -1 });

function validateProduct(product) {
  const schema = Joi.object({
    user: Joi.string().optional(),
    brand: Joi.string().allow("").optional(),
    sku: Joi.string().allow("").optional(),
    category: Joi.string().allow("").optional(),
    inventory: Joi.number().optional(),
    price: Joi.number().optional(),
    description: Joi.string().allow("").optional(),
    metafields: Joi.object({
      caseMaterial: Joi.string().allow("").optional(),
      dialColor: Joi.string().allow("").optional(),
      waterResistance: Joi.string().allow("").optional(),
      warrantyPeriod: Joi.string().allow("").optional(),
      movement: Joi.string().allow("").optional(),
      gender: Joi.string().allow("").optional(),
      caseSize: Joi.string().allow("").optional(),
    }).optional(),
    images: Joi.array().items(
      Joi.object({
        _id: Joi.string().optional(),
        url: Joi.string().allow("").optional(),
        altText: Joi.string().allow("").optional(),
        filename: Joi.string().optional(),
      })
    ).optional(),
    image: Joi.object({
      url: Joi.string().allow("").optional(),
      altText: Joi.string().allow("").optional(),
    }).optional(),
  });

  return schema.validate(product);
}

module.exports.Product = Product;
module.exports.validateProduct = validateProduct;

