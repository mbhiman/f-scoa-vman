"use client";

import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
    type ColumnDef,
    type SortingState,
    type ColumnFiltersState,
    type VisibilityState,
} from "@tanstack/react-table";
import { useState } from "react";
import {
    ChevronUp, ChevronDown, ChevronsUpDown,
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    Search, Download, SlidersHorizontal,
} from "lucide-react";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    searchKey?: string;
    searchPlaceholder?: string;
    title?: string;
    description?: string;
    actions?: React.ReactNode;
    isLoading?: boolean;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    searchPlaceholder = "Search...",
    title,
    description,
    actions,
    isLoading = false,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: { sorting, columnFilters, columnVisibility, rowSelection },
        initialState: { pagination: { pageSize: 10 } },
    });

    const selectedCount = Object.keys(rowSelection).length;

    return (
        <div className="rounded-xl border border-admin-border bg-admin-card shadow-admin-card overflow-hidden">
            {/* Header */}
            {(title || actions || searchKey) && (
                <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-admin-border flex-wrap bg-admin-bg">
                    <div className="flex-1 min-w-0">
                        {title && (
                            <h3 className="text-sm font-semibold text-admin-fg">
                                {title}
                            </h3>
                        )}
                        {description && (
                            <p className="text-xs mt-0.5 text-admin-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        {searchKey && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-admin-border bg-admin-card text-sm focus-within:border-admin-primary focus-within:ring-2 focus-within:ring-admin-primary/20 transition-all">
                                <Search className="w-3.5 h-3.5 text-admin-muted-foreground" />
                                <input
                                    className="bg-transparent outline-none w-48 text-admin-fg placeholder:text-admin-muted"
                                    placeholder={searchPlaceholder}
                                    value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                                    onChange={(e) => table.getColumn(searchKey)?.setFilterValue(e.target.value)}
                                />
                            </div>
                        )}
                        {selectedCount > 0 && (
                            <span className="text-xs px-2.5 py-1 rounded-md bg-admin-accent-soft text-admin-primary font-medium">
                                {selectedCount} selected
                            </span>
                        )}
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-admin-border text-xs font-medium text-admin-muted-foreground hover:bg-admin-muted/10 transition-colors">
                            <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-admin-border text-xs font-medium text-admin-muted-foreground hover:bg-admin-muted/10 transition-colors">
                            <Download className="w-3.5 h-3.5" /> Export
                        </button>
                        {actions}
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id} className="border-b border-admin-border bg-admin-muted/5">
                                {headerGroup.headers.map((header) => (
                                    <th key={header.id} className="px-5 py-3 text-left">
                                        {header.isPlaceholder ? null : (
                                            <div
                                                className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-admin-muted-foreground select-none ${header.column.getCanSort() ? "cursor-pointer hover:text-admin-fg transition-colors" : ""}`}
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {header.column.getCanSort() && (
                                                    <span className="ml-1 text-admin-muted-foreground">
                                                        {header.column.getIsSorted() === "asc" ? (
                                                            <ChevronUp className="w-3.5 h-3.5" />
                                                        ) : header.column.getIsSorted() === "desc" ? (
                                                            <ChevronDown className="w-3.5 h-3.5" />
                                                        ) : (
                                                            <ChevronsUpDown className="w-3.5 h-3.5 opacity-30" />
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length} className="py-16 text-center text-sm text-admin-muted-foreground">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-6 h-6 border-2 border-admin-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                                        Loading data...
                                    </div>
                                </td>
                            </tr>
                        ) : table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <tr key={row.id} className="hover:bg-admin-muted/5 transition-colors border-b border-admin-border last:border-0">
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="px-5 py-3.5 text-admin-fg align-middle">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="py-16 text-center text-sm text-admin-muted-foreground">
                                    No results found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-admin-border bg-admin-bg">
                <p className="text-xs text-admin-muted-foreground">
                    Showing <span className="font-medium text-admin-fg">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span>–
                    <span className="font-medium text-admin-fg">{Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)}</span>{" "}
                    of <span className="font-medium text-admin-fg">{table.getFilteredRowModel().rows.length}</span> results
                </p>
                <div className="flex items-center gap-1.5">
                    {[
                        { icon: ChevronsLeft, action: () => table.setPageIndex(0), disabled: !table.getCanPreviousPage() },
                        { icon: ChevronLeft, action: () => table.previousPage(), disabled: !table.getCanPreviousPage() },
                        { icon: ChevronRight, action: () => table.nextPage(), disabled: !table.getCanNextPage() },
                        { icon: ChevronsRight, action: () => table.setPageIndex(table.getPageCount() - 1), disabled: !table.getCanNextPage() },
                    ].map(({ icon: Icon, action, disabled }, i) => (
                        <button
                            key={i}
                            onClick={action}
                            disabled={disabled}
                            className="w-8 h-8 flex items-center justify-center rounded-md border border-admin-border text-admin-muted-foreground hover:bg-admin-muted/10 hover:text-admin-fg transition-colors disabled:opacity-40 disabled:pointer-events-none"
                        >
                            <Icon className="w-4 h-4" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}