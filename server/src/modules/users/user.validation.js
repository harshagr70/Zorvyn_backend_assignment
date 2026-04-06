const { z } = require("zod");
const mongoose = require("mongoose");
const { ROLES, STATUS } = require("../../shared/constants");

const idSchema = z.string().refine((value) => mongoose.Types.ObjectId.isValid(value), {
  message: "Invalid user id",
});

const listUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
    role: z.enum(Object.values(ROLES)).optional(),
    status: z.enum(Object.values(STATUS)).optional(),
  }),
});

const updateUserSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
  body: z
    .object({
      name: z.string().min(2).max(100).optional(),
      role: z.enum(Object.values(ROLES)).optional(),
      status: z.enum(Object.values(STATUS)).optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required",
    }),
});

const userIdSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
});

module.exports = { listUsersSchema, updateUserSchema, userIdSchema };
