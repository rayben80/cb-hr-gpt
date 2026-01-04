// Form utilities using react-hook-form + zod
// Example schema and hook patterns

import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('올바른 이메일 형식이 아닙니다');
export const requiredString = z.string().min(1, '필수 입력 항목입니다');
export const optionalString = z.string().optional();

// Example: Member form schema
export const memberFormSchema = z.object({
    name: requiredString,
    email: emailSchema,
    role: requiredString,
    hireDate: requiredString,
    status: z.enum(['active', 'on_leave', 'resigned', 'intern']),
});

export type MemberFormData = z.infer<typeof memberFormSchema>;

// Example: Team form schema
export const teamFormSchema = z.object({
    name: requiredString,
    lead: optionalString,
    headquarterId: optionalString,
});

export type TeamFormData = z.infer<typeof teamFormSchema>;

// Re-export for convenience
export { z };
