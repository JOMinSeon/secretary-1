import React from 'react';
import Link from 'next/link';
import { PricingSection } from '@/components/PricingSection';

export default function TaxAILandingPage() {
  return (
    <div className="bg-slate-50 text-slate-900 font-sans break-keep selection:bg-blue-100 min-h-screen">
      {/* 1. 메인 헤드라인 (Hero Section) */}
      <header className="relative bg-blue-600 text-white py-24 md:py-32 px-6 text-center overflow-hidden">
        {/* Background Decorative patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <Badge text="소상공인 전담 AI 세무 비서" />
          <h1 className="text-4xl md:text-6xl font-extrabold mb-8 leading-tight tracking-tight">
            사장님은 장사만 하세요.<br />
            <span className="text-blue-200">세금은 AI가 알아서 합니다.</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 font-light text-blue-100 max-w-2xl mx-auto leading-relaxed">
            매달 나가는 세무 대리 비용은 줄이고, 누락되는 공제 혜택은 AI가 찾아냅니다.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/dashboard">
              <button className="w-full sm:w-auto bg-white text-blue-600 font-bold py-4 px-10 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 text-xl">
                지금 바로 시작하기
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="w-full sm:w-auto bg-blue-700 text-white font-semibold py-4 px-10 rounded-2xl border border-blue-500 hover:bg-blue-800 transition-all duration-300 text-xl">
                서비스 둘러보기
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. 공감 포인트 (Problem Section) */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
              &quot;어제 쓴 영수증, 어디 있더라?&quot;<br className="md:hidden" /> 매번 찾는 것도 일입니다.
            </h2>
            <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <ProblemCard
              emoji="🤔"
              text="바빠서 챙기지 못한 경비, 세금 폭탄으로 돌아올까 불안하신가요?"
            />
            <ProblemCard
              emoji="📚"
              text="세무사에게 물어보기엔 사소하고, 직접 찾기엔 너무 어려운 세무 지식."
            />
            <ProblemCard
              emoji="💸"
              text="매달 고정적으로 나가는 기장료가 부담스럽진 않으신가요?"
            />
          </div>
        </div>
      </section>

      {/* 3. 핵심 기능 (Solution Section) */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
              어려운 장부 작성, 이제 1분이면 충분합니다
            </h2>
            <p className="text-slate-500 text-lg italic">복잡한 세무 업무, AI가 가장 잘하는 영역입니다.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="📊"
              title="손 안 대고 끝내는 자동 장부"
              description="카드, 통장 연동 한 번으로 AI가 지출 내역을 알아서 분류합니다."
            />
            <FeatureCard
              icon="💬"
              title="카톡처럼 편한 세무 상담"
              description=" 궁금할 때마다 AI 챗봇에게 바로 물어보세요. 24시간 잠들지 않는 사장님 전담 세무 비서입니다."
            />
            <FeatureCard
              icon="💰"
              title="놓친 환급금 찾기"
              description="업종별 맞춤 분석으로 사장님이 몰라서 못 받았던 절세 혜택을 끝까지 찾아드립니다."
            />
          </div>
        </div>
      </section>

      {/* 4. 가격 정책 (Pricing Section) */}
      <PricingSection />

      {/* 5. 최종 행동 유도 (CTA Section) */}
      <section className="py-24 px-6 bg-slate-900 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent" />
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-10 text-white leading-tight">
            &quot;오늘 가입하면 이번 분기 부가세 신고는 <span className="text-blue-400">0원!</span>&quot;
          </h2>
          <p className="text-slate-400 text-xl mb-12">선착순 100분께만 드리는 한정 혜택을 놓치지 마세요.</p>
          <Link href="/dashboard">
            <button className="bg-blue-600 text-white font-black py-5 px-14 rounded-full shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all duration-300 text-2xl">
              지금 바로 무료로 시작하기
            </button>
          </Link>
          <p className="text-slate-500 mt-8 text-sm">카드 등록 없이도 바로 시작할 수 있습니다.</p>
        </div>
      </section>

      <footer className="py-12 bg-slate-50 text-center border-t border-slate-200">
        <p className="text-slate-400">© 2026 axAI Secretary. All rights reserved.</p>
      </footer>
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span className="inline-block bg-blue-500/30 backdrop-blur-sm text-blue-100 text-sm font-bold px-4 py-1.5 rounded-full mb-6 border border-blue-400/30">
      {text}
    </span>
  );
}

function ProblemCard({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="bg-slate-50 p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center transition-all duration-300 hover:shadow-md hover:translate-y-[-4px]">
      <span className="text-4xl mb-6">{emoji}</span>
      <p className="text-lg font-medium text-slate-700 leading-relaxed">
        {text}
      </p>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group">
      <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300 w-fit">{icon}</div>
      <h3 className="text-2xl font-bold mb-4 text-slate-900">{title}</h3>
      <p className="text-slate-500 leading-relaxed text-lg">
        {description}
      </p>
    </div>
  );
}

