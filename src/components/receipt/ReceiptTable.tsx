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

export const columns: ColumnDef<ReceiptData>[] = [
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
            return <span>{new Date(dateStr).toLocaleString('ko-KR')}</span>;
        }
    },
    {
        accessorKey: "total_amount",
        header: () => <div className="text-right">결제금액</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("total_amount"));
            const formatted = new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(amount);
            return <div className="text-right font-medium">{formatted}</div>;
        },
    },
    {
        accessorKey: "category",
        header: "카테고리",
        cell: ({ row }) => <Badge variant="outline">{row.getValue("category")}</Badge>,
    },
    {
        accessorKey: "is_deductible",
        header: "공제여부",
        cell: ({ row }) => (
            row.getValue("is_deductible")
                ? <Badge className="bg-emerald-50 text-emerald-700 border-none hover:bg-emerald-100">공제 대상</Badge>
                : <Badge variant="secondary" className="text-slate-500">비공제</Badge>
        ),
    },
];

export function ReceiptTable() {
    const [data, setData] = useState<ReceiptData[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const { isPremium } = useSubscription();
    const supabase = createClient();
    const service = createReceiptService(supabase);

    // 데이터 페칭
    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await service.getReceipts();
                setData(result);
            } catch (error) {
                console.error("Fetch Data Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // 엑셀 다운로드 핸들러
    const handleDownload = async () => {
        if (!isPremium) return;
        setDownloading(true);
        try {
            const base64 = await generateExcelReport();

            // Base64를 Blob으로 변환하여 다운로드 트리거
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
            console.error("Download Error:", error);
            alert("엑셀 다운로드 중 오류가 발생했습니다.");
        } finally {
            setDownloading(false);
        }
    };

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
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto text-indigo-600 border-indigo-200"
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
            <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="bg-slate-50/50 hover:bg-slate-50/50">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="font-semibold text-slate-700">
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
                                <TableCell colSpan={columns.length} className="h-32 text-center">
                                    <div className="flex flex-col items-center gap-2 text-slate-400">
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        <p className="text-sm">매입 내역을 불러오는 중...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="hover:bg-slate-50/80 transition-colors"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-4">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-slate-500">
                                    데이터가 없습니다.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage() || loading}
                >
                    이전
                </Button>
                <div className="text-sm text-slate-500 px-2">
                    {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage() || loading}
                >
                    다음
                </Button>
            </div>
        </div>
    );
}

