import React from 'react';
import Link from 'next/link';
import { PricingSection } from '@/components/PricingSection';

export default function TaxAILandingPage() {
  return (
    <main className="bg-slate-50 text-slate-900 font-sans break-keep selection:bg-blue-100 min-h-screen">
      {/* 1. 메인 헤드라인 (Hero Section) */}
      <header className="relative bg-blue-600 text-white py-24 md:py-32 px-6 text-center overflow-hidden">
        {/* Background Decorative patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" aria-hidden="true">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <Badge text="🔥 사장님 1,200+명이 선택한 AI 세무 비서" />
          <h1 className="text-4xl md:text-6xl font-extrabold mb-8 leading-tight tracking-tight">
            영수증 찍으면 3초 만에<br />
            <span className="text-yellow-300">장부 작성 끝.</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 font-light text-blue-100 max-w-2xl mx-auto leading-relaxed">
            세무사 기장료 <strong className="text-white">연 120만원</strong> 아끼고,<br className="hidden md:inline" />
            놓치던 공제 혜택까지 AI가 알아서 챙깁니다.
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
              혹시 사장님도 이런 고민,<br className="md:hidden" /> 하고 계신가요?
            </h2>
            <p className="text-slate-500 text-lg">아래 하나라도 해당된다면, axAI가 답입니다.</p>
            <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full mt-4" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <ProblemCard
              emoji="😰"
              text="영수증 서랍에 쌓아두다가 부가세 신고 때마다 야근하시죠?"
            />
            <ProblemCard
              emoji="💸"
              text="세무사 기장료만 월 10만원… 매출 없는 달에도 나가는 고정비가 부담되시죠?"
            />
            <ProblemCard
              emoji="😱"
              text="'이것도 경비 처리 되나?' 몰라서 못 받은 환급금, 평균 47만원입니다."
            />
          </div>
        </div>
      </section>

      {/* 3. 핵심 기능 (Solution Section) */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
              찍고, 물어보고, 환급받고.<br className="md:hidden" /> <span className="text-blue-600">딱 3가지</span>만 하세요.
            </h2>
            <p className="text-slate-500 text-lg">나머지는 AI가 알아서 합니다. 진짜로요.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="📸"
              title="찍으면 끝. 3초 자동 장부"
              description="영수증 사진 한 장이면 AI가 날짜·금액·항목을 자동으로 분류하고 장부에 기록합니다. 엑셀 입력은 이제 안녕."
            />
            <FeatureCard
              icon="💬"
              title="새벽 2시에도 답해주는 세무 상담"
              description="'이거 경비 처리 되나요?' 궁금할 때 바로 물어보세요. AI가 사장님 업종에 맞춰 즉시 답변합니다."
            />
            <FeatureCard
              icon="💰"
              title="못 받던 환급금, 평균 47만원 찾기"
              description="업종·매출 규모에 맞는 공제 항목을 AI가 자동 분석합니다. 몰라서 못 받았던 돈, 이제 찾아가세요."
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
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
            영수증 10장, <span className="text-yellow-300">무료로</span> 분석해 보세요.
          </h2>
          <p className="text-slate-300 text-xl mb-4">가입 후 30초면 첫 영수증 분석 결과를 받아볼 수 있습니다.</p>
          <p className="text-blue-300 text-base mb-10 font-medium">⏰ 이번 달 가입 시 PREMIUM 7일 무료 체험 제공</p>
          <Link href="/signup">
            <button className="bg-yellow-400 text-slate-900 font-black py-5 px-14 rounded-full shadow-[0_0_30px_rgba(250,204,21,0.4)] hover:bg-yellow-300 hover:scale-105 active:scale-95 transition-all duration-300 text-2xl">
              무료로 시작하기 →
            </button>
          </Link>
          <p className="text-slate-400 mt-8 text-sm">카드 등록 없이 바로 시작 · 언제든 해지 가능</p>
        </div>
      </section>

      <footer className="py-12 bg-slate-50 text-center border-t border-slate-200">
        <p className="text-slate-600">© 2026 axAI Secretary. All rights reserved.</p>
      </footer>
    </main>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span className="inline-block bg-blue-500/40 backdrop-blur-sm text-white text-sm font-bold px-4 py-1.5 rounded-full mb-6 border border-blue-300/50">
      {text}
    </span>
  );
}

function ProblemCard({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="bg-slate-50 p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center transition-all duration-300 hover:shadow-md hover:translate-y-[-4px]" role="article">
      <span className="text-4xl mb-6" aria-hidden="true">{emoji}</span>
      <p className="text-lg font-medium text-slate-700 leading-relaxed">
        {text}
      </p>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <article className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group">
      <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300 w-fit" aria-hidden="true">{icon}</div>
      <h3 className="text-2xl font-bold mb-4 text-slate-900">{title}</h3>
      <p className="text-slate-600 leading-relaxed text-lg">
        {description}
      </p>
    </article>
  );
}

