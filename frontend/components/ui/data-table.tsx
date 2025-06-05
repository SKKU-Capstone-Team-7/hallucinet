"use client"
 
import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LucideSearch } from "lucide-react"
import { ReloadButton } from "../common/ReloadButtion"
 
interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  filterColumnKey: string;
  option?: React.ReactNode;
  onRowClick?: (row: TData) => void;
}

 
export function DataTable<TData>({
  columns,
  data,
  filterColumnKey,
  option
}: DataTableProps<TData>) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 5
      }
    }
  })
  
 
  return (
    <div>
        <div className="mt-4 flex items-center gap-4">
            <div className="grow max-w-lg">
                <div className="flex items-center shadow-sm rounded-sm">
                    <div className="p-2">
                        <LucideSearch />
                    </div>
                    <Input
                        placeholder="Search"
                        value={(table.getColumn(filterColumnKey)?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                        table.getColumn(filterColumnKey)?.setFilterValue(event.target.value)
                        }
                    className="border-none shadow-none focus:border-none focus-visible:border-none focus-within:border-none outline-none"
                    />
                </div>
            </div>
            {option}
        </div>
    <div className="rounded-md border mt-2 max-w-4xl">
      <Table className="w-full table-fixed">
        <colgroup>
            {columns.map((column) => (
              <col
                key={(column as any).id || (column as any).accessorKey} // column.id 또는 accessorKey 사용
                className={(column.meta as any)?.widthClass || 'w-auto'} // meta에서 widthClass 가져오기
              />
            ))}
          </colgroup>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead className="text-lg" key={header.id}>
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
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="h-10 text-base whitespace-nowrap overflow-hidden [mask-image:linear-gradient(to_right,black_75%,transparent_100%)]">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
    <div className="flex items-center justify-end space-x-2 py-4 max-w-4xl">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}