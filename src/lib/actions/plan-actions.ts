'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

/**
 * 플랜 이름 타입 (DB의 plans.name 컬럼 값과 일치)
 */
export type PlanName = 'FREE' | 'PREMIUM' | 'PRO';

interface CreatePlanInput {
  name: PlanName;
  price: number;
  base_receipt_limit: number;
}

/**
 * [Server Action] 플랜 생성 또는 업데이트
 * - supabaseAdmin(service_role)을 사용해 RLS를 우회합니다.
 * - 동일한 name의 플랜이 이미 존재하면 price/base_receipt_limit을 업데이트합니다.
 * - 실제 plans 테이블 스키마 컬럼: id, name, base_receipt_limit, price, created_at
 */
export async function createPlan(input: CreatePlanInput) {
  const { name, price, base_receipt_limit } = input;

  const { data, error } = await supabaseAdmin
    .from('plans')
    .upsert(
      {
        name,
        price,
        base_receipt_limit,
      },
      { onConflict: 'name' }
    )
    .select()
    .single();

  if (error) {
    console.error('[createPlan] Supabase 삽입 에러:', error.message);
    throw new Error(`플랜 생성에 실패했습니다: ${error.message}`);
  }

  revalidatePath('/dashboard');
  revalidatePath('/settings');

  return data;
}

/**
 * [Server Action] FormData 기반 플랜 생성 (form action용)
 * FREE 플랜은 기본 영수증 한도(10)와 가격(0)을 자동 지정합니다.
 */
export async function createPlanFromFormData(formData: FormData) {
  const name = formData.get('name') as PlanName;
  const price = Number(formData.get('price') ?? 0);
  const base_receipt_limit = Number(formData.get('base_receipt_limit') ?? (name === 'FREE' ? 10 : 0));

  return createPlan({ name, price, base_receipt_limit });
}
