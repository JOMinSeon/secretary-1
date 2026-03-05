"use client";

import React, { useState } from "react";
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
import { ArrowUpDown, Lock, Search, Download } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

// Mock Data Type
export type Receipt = {
    id: string;
    merchantName: string;
    date: string;
    amount: number;
    category: string;
    status: "completed" | "pending" | "error";
    isDeductible: boolean;
};

// Mock Data
const data: Receipt[] = [
    { id: "1", merchantName: "스타벅스 강남점", date: "2024-03-05 14:20", amount: 5400, category: "Food", status: "completed", isDeductible: false },
    { id: "2", merchantName: "이마트 역삼점", date: "2024-03-04 18:30", amount: 125000, category: "Supplies", status: "completed", isDeductible: true },
    { id: "3", merchantName: "개인택시(서울)", date: "2024-03-03 09:15", amount: 15000, category: "Transportation", status: "completed", isDeductible: false },
    { id: "4", merchantName: "오피스디포", date: "2024-03-02 11:45", amount: 45000, category: "Supplies", status: "completed", isDeductible: true },
    { id: "5", merchantName: "SK주유소", date: "2024-03-01 16:00", amount: 60000, category: "Fuel", status: "completed", isDeductible: true },
    { id: "6", merchantName: "우체국", date: "2024-02-28 10:20", amount: 4000, category: "Supplies", status: "completed", isDeductible: true },
    { id: "7", merchantName: "김밥천국", date: "2024-02-28 12:30", amount: 8000, category: "Food", status: "completed", isDeductible: false },
];

export const columns: ColumnDef<Receipt>[] = [
    {
        accessorKey: "merchantName",
        header: "상호명",
    },
    {
        accessorKey: "date",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    결제일시
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "amount",
        header: () => <div className="text-right">결제금액</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"));
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
        accessorKey: "isDeductible",
        header: "공제여부",
        cell: ({ row }) => (
            row.getValue("isDeductible")
                ? <Badge className="bg-emerald-50 text-emerald-700 border-none hover:bg-emerald-100">공제 대상</Badge>
                : <Badge variant="secondary" className="text-slate-500">비공제</Badge>
        ),
    },
];

export function ReceiptTable() {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const { isPremium } = useSubscription();

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
            {/* 툴바 & 필터 (PREMIUM 기능 데모 부분) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex w-full sm:w-auto items-center gap-2">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder={isPremium ? "상호명으로 검색..." : "상호명 검색 (Premium 전용)"}
                            value={(table.getColumn("merchantName")?.getFilterValue() as string) ?? ""}
                            onChange={(event) => table.getColumn("merchantName")?.setFilterValue(event.target.value)}
                            className="pl-10 h-10 bg-slate-50 border-none focus-visible:ring-indigo-500"
                            disabled={!isPremium}
                        />
                    </div>
                    {!isPremium && (
                        <div className="hidden sm:flex items-center text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-md font-medium">
                            <Lock className="w-3 h-3 mr-1" />
                            상세 필터 잠김
                        </div>
                    )}
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto text-indigo-600 border-indigo-200"
                    disabled={!isPremium}
                >
                    <Download className="w-4 h-4 mr-2" />
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
                        {table.getRowModel().rows?.length ? (
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
                                    {isPremium ? "검색 결과가 없습니다." : "데이터가 없거나 필터 권한이 없습니다."}
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
                    disabled={!table.getCanPreviousPage()}
                >
                    이전
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    다음
                </Button>
            </div>
        </div>
    );
}
