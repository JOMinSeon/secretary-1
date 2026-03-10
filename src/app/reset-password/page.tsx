'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Loader2, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isSuccess, setIsSuccess] = useState(false)

    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (password !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다. 다시 확인해 주세요.')
            return
        }

        if (password.length < 8) {
            setError('비밀번호는 최소 8자 이상이어야 합니다.')
            return
        }

        setLoading(true)

        const { error } = await supabase.auth.updateUser({ password })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            setIsSuccess(true)
            setLoading(false)
            setTimeout(() => router.push('/login'), 3000)
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-md"
                >
                    <Card className="border-none shadow-2xl rounded-[32px] overflow-hidden bg-white p-10 text-center">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="text-emerald-600 w-10 h-10" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-slate-900 mb-3">
                            비밀번호가 변경되었습니다! 🎉
                        </CardTitle>
                        <CardDescription className="text-slate-500 text-base mb-8 leading-relaxed">
                            새 비밀번호로 성공적으로 변경되었습니다. <br />
                            잠시 후 로그인 페이지로 이동합니다.
                        </CardDescription>
                        <Link href="/login">
                            <Button className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold">
                                지금 로그인하기
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
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <ShieldCheck className="text-white w-7 h-7" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">새 비밀번호 설정</h1>
                    <p className="text-slate-500 mt-2 font-medium text-sm">
                        안전한 새 비밀번호를 입력해 주세요.
                    </p>
                </div>

                <Card className="border-none shadow-2xl shadow-slate-200 rounded-[32px] overflow-hidden bg-white/80 backdrop-blur-xl">
                    <CardHeader className="pt-10 pb-4 px-8 text-center">
                        <CardTitle className="text-xl font-bold text-slate-900">비밀번호 재설정</CardTitle>
                        <CardDescription className="text-slate-400 mt-1">
                            8자 이상의 영문, 숫자 조합을 권장합니다.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pb-10">
                        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-bold text-slate-600 ml-1">
                                    새 비밀번호
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="새 비밀번호 입력 (8자 이상)"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={8}
                                        className="h-12 rounded-2xl bg-slate-100/50 border-none focus-visible:ring-2 focus-visible:ring-indigo-500 pl-11"
                                    />
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-sm font-bold text-slate-600 ml-1">
                                    비밀번호 확인
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="비밀번호를 다시 입력하세요"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="h-12 rounded-2xl bg-slate-100/50 border-none focus-visible:ring-2 focus-visible:ring-indigo-500 pl-11"
                                    />
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
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
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '비밀번호 변경하기'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-center mt-8 text-sm text-slate-500 font-medium">
                    <Link href="/login" className="text-indigo-600 hover:underline font-bold">
                        로그인 페이지로 돌아가기
                    </Link>
                </p>
            </motion.div>
        </div>
    )
}
