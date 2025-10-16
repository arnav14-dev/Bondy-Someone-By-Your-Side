import { z } from 'zod';

export const signupSchema = z.object({
    username: z.string().min(3).max(20),
    contactNumber: z.string().min(10).max(10),
    password: z.string().min(8).max(50),
    governmentIdType: z.enum(['Aadhaar', 'PAN', 'Voter ID', 'Driving License']),
    idVerificationMethod: z.enum(['number', 'image']),
    governmentId: z.string().min(10).max(20).optional().nullable(),
    idImage: z.string().optional().nullable(),
    idImageOriginalName: z.string().optional().nullable(),
    profilePicture: z.string().optional().nullable(),
    profilePictureOriginalName: z.string().optional().nullable(),
}).refine((data) => {
    // If verification method is 'number', governmentId is required
    if (data.idVerificationMethod === 'number') {
        return data.governmentId && data.governmentId.length >= 10;
    }
    // If verification method is 'image', idImage is required
    if (data.idVerificationMethod === 'image') {
        return data.idImage && data.idImage.length > 0;
    }
    return true;
}, {
    message: "Either governmentId (for number method) or idImage (for image method) is required",
    path: ["idVerificationMethod"]
});