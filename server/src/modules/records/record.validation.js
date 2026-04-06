const { z } = require("zod");
const mongoose = require("mongoose");
const { CATEGORIES, RECORD_TYPES } = require("../../shared/constants");

const idSchema = z.string().refine((value) => mongoose.Types.ObjectId.isValid(value), {
  message: "Invalid record id",
});

const dateString = z
  .string()
  .datetime({ message: "Date must be a valid ISO 8601 string" })
  .refine((value) => new Date(value) <= new Date(), {
    message: "Date cannot be in the future",
  });

const createRecordSchema = z.object({
  body: z.object({
    amount: z.coerce.number().positive().max(999999999.99),
    type: z.enum(Object.values(RECORD_TYPES)),
    category: z.enum(CATEGORIES),
    date: dateString,
    description: z.string().max(500).optional(),
  }),
});

const updateRecordSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
  body: z
    .object({
      amount: z.coerce.number().positive().max(999999999.99).optional(),
      type: z.enum(Object.values(RECORD_TYPES)).optional(),
      category: z.enum(CATEGORIES).optional(),
      date: dateString.optional(),
      description: z.string().max(500).optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required",
    }),
});

const listRecordsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    type: z.enum(Object.values(RECORD_TYPES)).optional(),
    category: z.enum(CATEGORIES).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    sort: z.string().optional(),
  }),
});

const recordIdSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
});

module.exports = { createRecordSchema, updateRecordSchema, listRecordsSchema, recordIdSchema };
