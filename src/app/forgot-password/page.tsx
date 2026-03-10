'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Loader2, ShieldCheck, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const redirectTo =
            typeof window !== 'undefined'
                ? `${window.location.origin}/auth/callback?next=/reset-password`
                : '/auth/callback?next=/reset-password'

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            setIsSubmitted(true)
            setLoading(false)
        }
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-md"
                >
                    <Card className="border-none shadow-2xl rounded-[32px] overflow-hidden bg-white p-10 text-center">
                        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="text-indigo-600 w-10 h-10" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-slate-900 mb-3">이메일을 확인해 주세요!</CardTitle>
                        <CardDescription className="text-slate-500 text-base mb-8 leading-relaxed">
                            <span className="font-bold text-slate-700">{email}</span> 주소로
                            비밀번호 재설정 링크를 보냈습니다. <br />
                            메일함을 확인하고 링크를 클릭해 주세요.
                        </CardDescription>
                        <p className="text-xs text-slate-400 mb-6">메일이 오지 않으면 스팸함을 확인하거나 다시 시도해 주세요.</p>
                        <Link href="/login">
                            <Button className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold">
                                로그인 페이지로 돌아가기
                            </Button>
                        </Link>
                    </Card>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden px-4">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-200 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/login" className="inline-flex items-center gap-2 group mb-6 text-slate-400 hover:text-indigo-600 transition-colors">
                        <ArrowLeft size={16} />
                        <span className="text-sm font-bold">로그인으로 돌아가기</span>
                    </Link>
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <ShieldCheck className="text-white w-7 h-7" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">비밀번호 재설정</h1>
                    <p className="text-slate-500 mt-2 font-medium text-sm">
                        가입하신 이메일 주소를 입력하시면 <br />
                        재설정 링크를 보내드립니다.
                    </p>
                </div>

                <Card className="border-none shadow-2xl shadow-slate-200 rounded-[32px] overflow-hidden bg-white/80 backdrop-blur-xl">
                    <CardHeader className="pt-10 pb-4 px-8 text-center">
                        <CardTitle className="text-xl font-bold text-slate-900">이메일 주소 입력</CardTitle>
                        <CardDescription className="text-slate-400 mt-1">
                            링크를 클릭하면 새 비밀번호를 설정할 수 있습니다.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pb-10">
                        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-bold text-slate-600 ml-1">
                                    이메일 주소
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="가입 시 사용한 이메일"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-12 rounded-2xl bg-slate-100/50 border-none focus-visible:ring-2 focus-visible:ring-indigo-500 pl-11"
                                    />
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                </div>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-red-50 text-red-600 text-xs font-medium p-3 rounded-xl border border-red-100"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '재설정 링크 보내기'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
