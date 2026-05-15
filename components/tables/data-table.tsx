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
    Search, SlidersHorizontal, X
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

    // UI State for toggling the filter drawer
    const [showFilters, setShowFilters] = useState(false);

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

    // Helper to count active column filters (excluding the main search key)
    const activeFiltersCount = columnFilters.filter(f => f.id !== searchKey).length;

    return (
        <div className="rounded-xl border border-admin-border bg-admin-card shadow-admin-card overflow-hidden">
            {/* Top Bar (Title, Search, Action Buttons) */}
            {(title || actions || searchKey) && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 border-b border-admin-border bg-admin-bg">

                    {/* Header Title area */}
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

                    {/* Actions & Search area - Mobile: stacked full width, Desktop: auto width inline */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">

                        {/* Search Input */}
                        {searchKey && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-admin-border bg-admin-card text-sm focus-within:border-admin-primary focus-within:ring-2 focus-within:ring-admin-primary/20 transition-all">
                                <Search className="w-3.5 h-3.5 text-admin-muted-foreground shrink-0" />
                                <input
                                    className="bg-transparent outline-none w-full sm:w-48 text-admin-fg placeholder:text-admin-muted"
                                    placeholder={searchPlaceholder}
                                    value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                                    onChange={(e) => table.getColumn(searchKey)?.setFilterValue(e.target.value)}
                                />
                            </div>
                        )}

                        {/* Action Buttons row */}
                        <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto mt-1 sm:mt-0">
                            <div className="flex items-center gap-2">
                                {selectedCount > 0 && (
                                    <span className="text-xs px-2.5 py-1 rounded-md bg-admin-accent-soft text-admin-primary font-medium">
                                        {selectedCount} selected
                                    </span>
                                )}

                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${showFilters || activeFiltersCount > 0 ? 'bg-admin-muted/10 border-admin-muted/30 text-admin-fg' : 'border-admin-border text-admin-muted-foreground hover:bg-admin-muted/5'}`}
                                >
                                    <SlidersHorizontal className="w-3.5 h-3.5" />
                                    Filters
                                    {activeFiltersCount > 0 && (
                                        <span className="flex items-center justify-center w-4 h-4 ml-1 text-[10px] text-white bg-admin-primary rounded-full">
                                            {activeFiltersCount}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Create Course Button (passed via props) */}
                            {actions}
                        </div>
                    </div>
                </div>
            )}

            {/* Expandable Filter Drawer */}
            {showFilters && (
                <div className="px-5 py-4 border-b border-admin-border bg-admin-muted/5 flex flex-col sm:flex-row gap-4 sm:items-end animate-in fade-in slide-in-from-top-2 duration-200">

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        {/* Status Filter */}
                        <div className="flex flex-col gap-1.5 w-full sm:w-48">
                            <label className="text-[11px] font-bold text-admin-muted-foreground uppercase tracking-wider">Status</label>
                            <select
                                className="w-full rounded-md border border-admin-border bg-admin-card px-3 py-2 text-sm text-admin-fg focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none transition-shadow"
                                value={(table.getColumn("status")?.getFilterValue() as string) ?? ""}
                                onChange={(e) => table.getColumn("status")?.setFilterValue(e.target.value || undefined)}
                            >
                                <option value="">All Statuses</option>
                                <option value="PUBLISHED">Published</option>
                                <option value="DRAFT">Draft</option>
                                <option value="DISABLED">Disabled</option>
                            </select>
                        </div>

                        {/* Course Type Filter */}
                        <div className="flex flex-col gap-1.5 w-full sm:w-48">
                            <label className="text-[11px] font-bold text-admin-muted-foreground uppercase tracking-wider">Course Type</label>
                            <select
                                className="w-full rounded-md border border-admin-border bg-admin-card px-3 py-2 text-sm text-admin-fg focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none transition-shadow"
                                value={(table.getColumn("isNcvet")?.getFilterValue() !== undefined ? String(table.getColumn("isNcvet")?.getFilterValue()) : "")}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    table.getColumn("isNcvet")?.setFilterValue(val === "" ? undefined : val === "true");
                                }}
                            >
                                <option value="">All Types</option>
                                <option value="true">NCVET Certified</option>
                                <option value="false">Standard</option>
                            </select>
                        </div>
                    </div>

                    {/* Clear Filters Action */}
                    {activeFiltersCount > 0 && (
                        <div className="flex items-end mt-2 sm:mt-0 pb-0.5">
                            <button
                                onClick={() => {
                                    table.getColumn("status")?.setFilterValue(undefined);
                                    table.getColumn("isNcvet")?.setFilterValue(undefined);
                                }}
                                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 sm:px-2 py-2.5 sm:py-1.5 rounded-md border border-admin-border sm:border-transparent bg-admin-card sm:bg-transparent shadow-sm sm:shadow-none text-xs font-medium text-red-500 sm:text-admin-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
                            >
                                <X className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Table Area... (Rest of the component remains exactly the same) */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id} className="border-b border-admin-border bg-admin-bg/50">
                                {headerGroup.headers.map((header) => (
                                    <th key={header.id} className="px-5 py-3 text-left whitespace-nowrap">
                                        {header.isPlaceholder ? null : (
                                            <div
                                                className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-admin-muted-foreground select-none ${header.column.getCanSort() ? "cursor-pointer hover:text-admin-fg transition-colors" : ""}`}
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {header.column.getCanSort() && (
                                                    <span className="ml-1 text-admin-muted-foreground">
                                                        {header.column.getIsSorted() === "asc" ? (
                                                            <ChevronUp className="w-3.5 h-3.5 text-admin-primary" />
                                                        ) : header.column.getIsSorted() === "desc" ? (
                                                            <ChevronDown className="w-3.5 h-3.5 text-admin-primary" />
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
                                <td colSpan={columns.length} className="py-24 text-center text-sm text-admin-muted-foreground">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-6 h-6 border-2 border-admin-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                                        Fetching data...
                                    </div>
                                </td>
                            </tr>
                        ) : table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <tr key={row.id} className="hover:bg-admin-muted/5 transition-colors border-b border-admin-border last:border-0 group">
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="px-5 py-4 text-admin-fg align-middle">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="py-24 text-center text-sm text-admin-muted-foreground flex flex-col items-center justify-center">
                                    <div className="bg-admin-muted/10 p-4 rounded-full mb-3">
                                        <Search className="w-6 h-6 text-admin-muted-foreground/50" />
                                    </div>
                                    <p className="font-medium text-admin-fg">No results found</p>
                                    <p className="text-xs mt-1">Try adjusting your filters or search query.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3 border-t border-admin-border bg-admin-bg gap-4">
                <p className="text-xs text-admin-muted-foreground text-center sm:text-left w-full sm:w-auto">
                    Showing <span className="font-medium text-admin-fg">{table.getFilteredRowModel().rows.length > 0 ? table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1 : 0}</span>–
                    <span className="font-medium text-admin-fg">{Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)}</span>{" "}
                    of <span className="font-medium text-admin-fg">{table.getFilteredRowModel().rows.length}</span> results
                </p>
                <div className="flex items-center gap-1.5 w-full sm:w-auto justify-center sm:justify-end">
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
                            className="w-8 h-8 flex items-center justify-center rounded-md border border-admin-border text-admin-muted-foreground hover:bg-admin-muted/10 hover:text-admin-fg transition-colors disabled:opacity-30 disabled:pointer-events-none"
                        >
                            <Icon className="w-4 h-4" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}