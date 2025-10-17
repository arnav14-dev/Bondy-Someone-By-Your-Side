import { z } from 'zod';

export const loginSchema = z.object({
    contactNumber: z.string().min(10).max(10),
    password: z.string().min(8).max(50)
});

export const signupSchema = z.object({
    username: z.string().min(3).max(20),
    contactNumber: z.string().min(10).max(10),
    password: z.string().min(8).max(50),
    profilePicture: z.string().optional().nullable(),
    profilePictureOriginalName: z.string().optional().nullable(),
});