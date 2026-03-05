import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Receipt,
  TrendingUp,
  CreditCard,
  Clock,
  Plus,
  ArrowRight
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-slate-900 leading-tight">안녕하세요, 사장님! 👋</h2>
          <p className="text-slate-500 mt-2 text-lg">오늘도 스마트하게 영수증을 관리해보세요.</p>
        </div>
        <div className="flex gap-3 relative z-10">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 px-6">
            <Plus className="w-5 h-5 mr-2" />
            새 영수증 업로드
          </Button>
        </div>
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-50 rounded-full -mr-20 -mt-20 opacity-50 blur-3xl" />
        <div className="absolute left-1/2 bottom-0 w-32 h-32 bg-indigo-100 rounded-full opacity-30 blur-2xl" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "이번 달 총 지출", value: "₩1,240,000", change: "+12.5%", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
          { title: "업로드 된 영수증", value: "8장", change: "무료 플랜", icon: Receipt, color: "text-indigo-500", bg: "bg-indigo-50" },
          { title: "환급 예상액", value: "₩124,000", change: "VAT 10%", icon: CreditCard, color: "text-amber-500", bg: "bg-amber-50" },
          { title: "최근 업로드", value: "2시간 전", change: "성공", icon: Clock, color: "text-blue-500", bg: "bg-blue-50" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{stat.title}</CardTitle>
              <div className={`${stat.bg} ${stat.color} p-2 rounded-lg`}>
                <stat.icon size={20} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <span className={stat.color === 'text-emerald-500' ? 'text-emerald-600' : ''}>{stat.change}</span>
                지난 달 대비
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>최근 영수증 내역</CardTitle>
              <CardDescription>최근 24시간 동안 업로드된 내역입니다.</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">
              전체 보기
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center justify-between p-4 rounded-xl border border-dashed border-slate-200 hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-white transition-colors">
                      <Receipt className="text-slate-400" size={24} />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">스타벅스 강남점</div>
                      <div className="text-xs text-slate-400">2024.03.05 | 14:20</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">₩5,400</div>
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-none text-[10px]">분석 완료</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upgrade Card */}
        <Card className="bg-indigo-900 text-white border-none relative overflow-hidden flex flex-col justify-between p-2">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-2xl font-bold">Premium으로 더 많은 혜택을</CardTitle>
            <CardDescription className="text-indigo-200 pt-2">
              무제한 영수증 분석과 전문가용 엑셀 리포트 기능을 이용해보세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <ul className="space-y-3 mb-6">
              {['무제한 영수증 분석', '세무 신고용 엑셀 다운로드', '카테고리별 상세 통계', '우선 순위 AI 처리'].map((feat) => (
                <li key={feat} className="flex items-center gap-2 text-sm text-indigo-100">
                  <div className="w-4 h-4 rounded-full bg-emerald-400 flex items-center justify-center">
                    <div className="w-2 h-2 bg-indigo-900 rounded-full" />
                  </div>
                  {feat}
                </li>
              ))}
            </ul>
            <Button className="w-full bg-white text-indigo-900 hover:bg-slate-100 font-bold py-6 rounded-xl">
              지금 업그레이드하기
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
