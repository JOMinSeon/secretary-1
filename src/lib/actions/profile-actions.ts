'use server';

import { createClient } from '@/lib/supabase/server';

export interface BusinessProfile {
    businessName: string;
    businessNumber: string;
    representativeName: string;
    address: string;
    phone: string;
}

/**
 * 사업자 프로필 정보 가져오기
 */
export async function getBusinessProfile() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        // 사용자가 소속된 조직 정보 조회
        const { data: memberData, error: memberError } = await supabase
            .from('organization_members')
            .select('org_id, organizations(*)')
            .eq('user_id', user.id)
            .single();

        if (memberError || !memberData || !memberData.organizations) {
            console.error('Member profile fetch error:', memberError);
            return null;
        }

        const org = memberData.organizations as { name?: string; business_number?: string; representative_name?: string; address?: string; phone?: string };
        return {
            businessName: org.name || '',
            businessNumber: org.business_number || '',
            representativeName: org.representative_name || '',
            address: org.address || '',
            phone: org.phone || ''
        } as BusinessProfile;
    } catch (error) {
        console.error('getBusinessProfile Error:', error);
        return null;
    }
}

/**
 * 사업자 프로필 정보 저장하기
 */
export async function updateBusinessProfile(data: BusinessProfile) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Unauthenticated');

        const { data: memberData } = await supabase
            .from('organization_members')
            .select('org_id')
            .eq('user_id', user.id)
            .single();

        if (!memberData) throw new Error('Organization not found');

        const { error } = await supabase
            .from('organizations')
            .update({
                name: data.businessName,
                business_number: data.businessNumber,
                representative_name: data.representativeName,
                address: data.address,
                phone: data.phone,
                updated_at: new Date().toISOString()
            })
            .eq('id', memberData.org_id);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : '알 수 없는 오류';
        console.error('updateBusinessProfile Error:', error);
        return { success: false, error: message };
    }
}
