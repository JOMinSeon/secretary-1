'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Loader2, ShieldCheck, Mail, Lock, User, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export default function SignUpPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const router = useRouter()
    const supabase = createClient()

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error, data } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                }
            }
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
                    className="w-full max-w-md"
                >
                    <Card className="border-none shadow-2xl rounded-[32px] overflow-hidden bg-white p-10 text-center">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="text-emerald-600 w-10 h-10" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-slate-900 mb-2">이메일을 확인해 주세요!</CardTitle>
                        <CardDescription className="text-slate-500 text-base mb-8">
                            {email} 주소로 가입 확인 메일을 보냈습니다. <br />
                            메일함의 링크를 클릭하여 가입을 완료해 주세요.
                        </CardDescription>
                        <Button
                            onClick={() => router.push('/login')}
                            className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold"
                        >
                            로그인 페이지로 돌아가기
                        </Button>
                    </Card>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden px-4">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-200 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-8">
                    <Link href="/login" className="inline-flex items-center gap-2 group mb-4 text-slate-400 hover:text-indigo-600 transition-colors">
                        <ArrowLeft size={16} />
                        <span className="text-sm font-bold">로그인으로 돌아가기</span>
                    </Link>
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <ShieldCheck className="text-white w-7 h-7" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">회원가입</h1>
                    <p className="text-slate-500 mt-2 font-medium">axAI Secretary와 함께 스마트한 세무 관리를 시작하세요.</p>
                </div>

                <Card className="border-none shadow-2xl shadow-slate-200 rounded-[32px] overflow-hidden bg-white/80 backdrop-blur-xl">
                    <CardHeader className="pt-10 pb-6 px-8 text-center">
                        <CardTitle className="text-xl font-bold text-slate-900">새 계정 만들기</CardTitle>
                    </CardHeader>
                    <CardContent className="px-8 pb-10">
                        <form onSubmit={handleSignUp} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="fullName" className="text-sm font-bold text-slate-600 ml-1">이름</Label>
                                <div className="relative">
                                    <Input
                                        id="fullName"
                                        type="text"
                                        placeholder="홍길동"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                        className="h-12 rounded-2xl bg-white border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 pl-11"
                                    />
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-bold text-slate-600 ml-1">이메일 주소</Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-12 rounded-2xl bg-white border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 pl-11"
                                    />
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" university-id="password" className="text-sm font-bold text-slate-600 ml-1">비밀번호</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="8자 이상의 비밀번호"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={8}
                                        className="h-12 rounded-2xl bg-white border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 pl-11"
                                    />
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                </div>
                                <p className="text-[10px] text-slate-400 ml-1">최소 8자 이상의 영문, 숫자 조합을 권장합니다.</p>
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
                                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] mt-4"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '가입하기'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-center mt-8 text-sm text-slate-500 font-medium">
                    이미 계정이 있으신가요? <Link href="/login" className="text-indigo-600 hover:underline font-bold">로그인하기</Link>
                </p>
            </motion.div>
        </div>
    )
}
