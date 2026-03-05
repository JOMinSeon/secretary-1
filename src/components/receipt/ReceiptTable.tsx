"use client";

import React, { useState, useEffect } from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    SortingState,
    getPaginationRowModel,
    ColumnFiltersState,
    getFilteredRowModel,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Lock, Search, Download, Loader2 } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { createReceiptService, type ReceiptData } from "@/lib/supabase/receipt-service";
import { createClient } from "@/lib/supabase/browser";
import { generateExcelReport } from "@/lib/actions/report-actions";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { MoreHorizontal, Edit, Trash2, Calendar as CalendarIcon, RefreshCw } from "lucide-react";
import { updateReceiptAction, deleteReceiptAction } from "@/lib/actions/receipt-management-actions";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ReceiptTable() {
    const [data, setData] = useState<ReceiptData[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const { isPremium } = useSubscription();

    // Edit State
    const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const supabase = createClient();
    const service = createReceiptService(supabase);

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await service.getReceipts();
            setData(result);
        } catch (error) {
            console.error("Fetch Data Error:", error);
        } finally {
            setLoading(false);
        }
    };

    // 데이터 페칭
    useEffect(() => {
        fetchData();
    }, []);

    const handleEdit = (receipt: ReceiptData) => {
        setSelectedReceipt({ ...receipt });
        setIsEditOpen(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedReceipt || !selectedReceipt.id) return;

        setIsSaving(true);
        try {
            const result = await updateReceiptAction(selectedReceipt.id, {
                merchant_name: selectedReceipt.merchant_name,
                receipt_date: selectedReceipt.receipt_date,
                total_amount: Number(selectedReceipt.total_amount),
                category: selectedReceipt.category,
                is_deductible: selectedReceipt.is_deductible
            });

            if (result.success) {
                await fetchData();
                setIsEditOpen(false);
            } else {
                alert("수정 실패: " + result.error);
            }
        } catch (error) {
            alert("오류가 발생했습니다.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("정말 이 영수증을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;

        setIsDeleting(id);
        try {
            const result = await deleteReceiptAction(id);
            if (result.success) {
                await fetchData();
            } else {
                alert("삭제 실패: " + result.error);
            }
        } catch (error) {
            alert("오류가 발생했습니다.");
        } finally {
            setIsDeleting(null);
        }
    };

    // 엑셀 다운로드 핸들러
    const handleDownload = async () => {
        if (!isPremium) return;
        setDownloading(true);
        try {
            const base64 = await generateExcelReport();
            const byteCharacters = atob(base64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `영수증_리포트_${new Date().toISOString().split('T')[0]}.xlsx`;
            link.click();
        } catch (error) {
            alert("엑셀 다운로드 중 오류가 발생했습니다.");
        } finally {
            setDownloading(false);
        }
    };

    const columns: ColumnDef<ReceiptData>[] = [
        {
            accessorKey: "merchant_name",
            header: "상호명",
        },
        {
            accessorKey: "receipt_date",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        결제일시
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const dateStr = row.getValue("receipt_date") as string;
                return <span className="text-slate-600">{new Date(dateStr).toLocaleString('ko-KR')}</span>;
            }
        },
        {
            accessorKey: "total_amount",
            header: () => <div className="text-right">결제금액</div>,
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue("total_amount"));
                const formatted = new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(amount);
                return <div className="text-right font-bold text-slate-900">{formatted}</div>;
            },
        },
        {
            accessorKey: "category",
            header: "카테고리",
            cell: ({ row }) => <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none">{row.getValue("category")}</Badge>,
        },
        {
            accessorKey: "is_deductible",
            header: "공제여부",
            cell: ({ row }) => (
                row.getValue("is_deductible")
                    ? <Badge className="bg-emerald-50 text-emerald-700 border-none">공제 대상</Badge>
                    : <Badge variant="outline" className="text-slate-400 border-slate-200">비공제</Badge>
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const receipt = row.original;
                return (
                    <div className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 rounded-xl">
                                <DropdownMenuLabel>작업</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleEdit(receipt)} className="cursor-pointer gap-2">
                                    <Edit size={14} /> 수정하기
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => receipt.id && handleDelete(receipt.id)}
                                    className="text-red-600 focus:text-red-600 cursor-pointer gap-2"
                                >
                                    {isDeleting === receipt.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                    삭제하기
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            }
        }
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: {
            sorting,
            columnFilters,
        },
    });

    return (
        <div className="w-full space-y-4">
            {/* 툴바 & 필터 */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex w-full sm:w-auto items-center gap-2">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder={isPremium ? "상호명으로 검색..." : "상호명 검색 (Premium 전용)"}
                            value={(table.getColumn("merchant_name")?.getFilterValue() as string) ?? ""}
                            onChange={(event) => table.getColumn("merchant_name")?.setFilterValue(event.target.value)}
                            className="pl-10 h-10 bg-slate-50 border-none focus-visible:ring-indigo-500"
                            disabled={!isPremium}
                        />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => fetchData()} className="text-slate-400">
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </Button>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto text-indigo-600 border-indigo-200 h-10 px-4 rounded-xl"
                    disabled={!isPremium || downloading}
                    onClick={handleDownload}
                >
                    {downloading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Download className="w-4 h-4 mr-2" />
                    )}
                    엑셀 다운로드
                    {!isPremium && <Lock className="w-3 h-3 ml-2 opacity-50" />}
                </Button>
            </div>

            {/* 데이터 테이블 */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="bg-slate-50/50 hover:bg-slate-50/50 border-b">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="font-bold text-slate-900 py-4 h-auto">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-48 text-center">
                                    <div className="flex flex-col items-center gap-2 text-slate-400">
                                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                                        <p className="font-medium">매입 내역 동기화 중...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="hover:bg-slate-50/80 transition-colors border-b last:border-0"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-5">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-32 text-center text-slate-400">
                                    등록된 영수증 내역이 없습니다.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between py-4">
                <p className="text-sm text-slate-500 font-medium">
                    총 <span className="text-slate-900 font-bold">{data.length}</span>개의 내역
                </p>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage() || loading}
                    >
                        이전
                    </Button>
                    <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg min-w-[32px] text-center">
                        {table.getState().pagination.pageIndex + 1}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage() || loading}
                    >
                        다음
                    </Button>
                </div>
            </div>

            {/* Edit Sheet */}
            <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
                <SheetContent className="sm:max-w-md rounded-l-3xl">
                    <SheetHeader className="mb-8">
                        <SheetTitle className="text-2xl font-bold">영수증 정보 수정</SheetTitle>
                        <SheetDescription>
                            AI가 분석한 영수증 정보를 필요에 맞게 수정하세요.
                        </SheetDescription>
                    </SheetHeader>

                    {selectedReceipt && (
                        <form onSubmit={handleUpdate} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="merchant">상호명</Label>
                                <Input
                                    id="merchant"
                                    value={selectedReceipt.merchant_name}
                                    onChange={(e) => setSelectedReceipt({ ...selectedReceipt, merchant_name: e.target.value })}
                                    className="rounded-xl h-12 bg-slate-50 border-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="amount">결제금액</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        value={selectedReceipt.total_amount}
                                        onChange={(e) => setSelectedReceipt({ ...selectedReceipt, total_amount: Number(e.target.value) })}
                                        className="rounded-xl h-12 bg-slate-50 border-none px-4"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>카테고리</Label>
                                    <Select
                                        value={selectedReceipt.category}
                                        onValueChange={(v) => setSelectedReceipt({ ...selectedReceipt, category: v })}
                                    >
                                        <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-none">
                                            <SelectValue placeholder="선택" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {['Food', 'Supplies', 'Transportation', 'Fuel', 'ETC'].map(cat => (
                                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="date">결제일시</Label>
                                <Input
                                    id="date"
                                    type="datetime-local"
                                    value={selectedReceipt.receipt_date?.substring(0, 16) || ''}
                                    onChange={(e) => setSelectedReceipt({ ...selectedReceipt, receipt_date: e.target.value })}
                                    className="rounded-xl h-12 bg-slate-50 border-none"
                                />
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                                <Label className="text-slate-900 font-bold">매입세액 공제 대상 여부</Label>
                                <Button
                                    type="button"
                                    variant={selectedReceipt.is_deductible ? "default" : "outline"}
                                    onClick={() => setSelectedReceipt({ ...selectedReceipt, is_deductible: !selectedReceipt.is_deductible })}
                                    className={selectedReceipt.is_deductible ? "bg-emerald-600 hover:bg-emerald-700 rounded-xl" : "rounded-xl border-slate-200"}
                                >
                                    {selectedReceipt.is_deductible ? "대상" : "비공제"}
                                </Button>
                            </div>

                            <SheetFooter className="pt-8">
                                <Button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 h-14 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-100"
                                >
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                    변경 내용 저장하기
                                </Button>
                            </SheetFooter>
                        </form>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}

