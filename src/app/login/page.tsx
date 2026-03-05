'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Loader2, ShieldCheck, Mail, Lock, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.push('/dashboard')
            router.refresh()
        }
    }

    const handleSignUp = async () => {
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signUp({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            alert('확인 이메일을 보냈습니다. 이메일을 확인해 주세요!')
            setLoading(false)
        }
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
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                            <ShieldCheck className="text-white w-6 h-6" />
                        </div>
                        <span className="text-2xl font-black text-slate-900 tracking-tight">axAI <span className="text-indigo-600">Secretary</span></span>
                    </Link>
                    <p className="text-slate-500 mt-3 font-medium">소상공인을 위한 가장 똑똑한 AI 세무 비서</p>
                </div>

                <Card className="border-none shadow-2xl shadow-slate-200 rounded-[32px] overflow-hidden bg-white/80 backdrop-blur-xl">
                    <CardHeader className="pt-10 pb-6 px-8 text-center">
                        <CardTitle className="text-2xl font-bold text-slate-900">반가워요! 👋</CardTitle>
                        <CardDescription className="text-slate-500">계정에 로그인하거나 새로 가입하세요.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                        <form onSubmit={handleLogin} className="space-y-5">
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
                                        className="h-12 rounded-2xl bg-slate-100/50 border-none focus-visible:ring-2 focus-visible:ring-indigo-500 pl-11"
                                    />
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <Label htmlFor="password" className="text-sm font-bold text-slate-600">비밀번호</Label>
                                    <button type="button" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">비밀번호를 잊으셨나요?</button>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="h-12 rounded-2xl bg-slate-100/50 border-none focus-visible:ring-2 focus-visible:ring-indigo-500 pl-11"
                                    />
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                </div>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-red-50 text-red-600 text-xs font-medium p-3 rounded-xl border border-red-100"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '로그인'}
                            </Button>
                        </form>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-100" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">or</span>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            onClick={handleSignUp}
                            disabled={loading}
                            className="w-full h-12 border-2 border-indigo-50 text-indigo-600 hover:bg-indigo-50 rounded-2xl font-bold transition-all"
                        >
                            이메일로 시작하기 (회원가입)
                        </Button>
                    </CardContent>
                    <CardFooter className="bg-slate-50/50 px-8 py-6 border-t border-slate-100 flex justify-center">
                        <p className="text-xs text-slate-400 text-center leading-relaxed">
                            계속 진행함에 따라 axAI Secretary의 <br />
                            <button className="underline hover:text-slate-600">서비스 이용약관</button> 및 <button className="underline hover:text-slate-600">개인정보 처리방침</button>에 동의하게 됩니다.
                        </p>
                    </CardFooter>
                </Card>

                {/* Support Link */}
                <p className="text-center mt-8 text-sm text-slate-500 font-medium">
                    도움이 필요하신가요? <button className="text-indigo-600 hover:underline">고객 센터 문의하기</button>
                </p>
            </motion.div>
        </div>
    )
}
