import { z } from 'zod';

export const TenantIdSchema = z.string().uuid();
export type TenantId = z.infer<typeof TenantIdSchema>;
