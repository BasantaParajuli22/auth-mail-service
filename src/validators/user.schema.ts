import { z } from 'zod';

export const RoleEnum = z.enum(["admin", "reader"]);
export type Role = z.infer<typeof RoleEnum>;

export  const userCreateSchema = z.object({
    username: z.string().optional(),
    email: z.string(),
    password: z.string(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

export  const userResponseSchema = z.object({
    username: z.string().optional(),
    email: z.string(),
    role: RoleEnum.optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

export type userCreateDto = z.infer<typeof userCreateSchema>;
export type userResponseDto = z.infer<typeof userResponseSchema>;