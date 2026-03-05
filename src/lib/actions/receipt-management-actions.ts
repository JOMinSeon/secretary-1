'use server';

import { createClient } from '@/lib/supabase/server';
import { createReceiptService, type ReceiptData } from '../supabase/receipt-service';
import { revalidatePath } from 'next/cache';

/**
 * 영수증 정보 수정
 */
export async function updateReceiptAction(id: string, updates: Partial<ReceiptData>) {
    try {
        const supabase = await createClient();
        const service = createReceiptService(supabase);

        await service.updateReceipt(id, updates);

        revalidatePath('/receipts');
        revalidatePath('/dashboard');
        revalidatePath('/reports');

        return { success: true };
    } catch (error: any) {
        console.error('Update Receipt Error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 영수증 삭제
 */
export async function deleteReceiptAction(id: string) {
    try {
        const supabase = await createClient();
        const service = createReceiptService(supabase);

        await service.deleteReceipt(id);

        revalidatePath('/receipts');
        revalidatePath('/dashboard');
        revalidatePath('/reports');

        return { success: true };
    } catch (error: any) {
        console.error('Delete Receipt Error:', error);
        return { success: false, error: error.message };
    }
}
