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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  filterColumnKey: string,
  option?: React.ReactNode
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterColumnKey,
  option
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

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
          <div className="flex items-center shadow-sm rounded-md bg-white px-2">
            <LucideSearch className="text-gray-500" />
            <Input
              placeholder="Search"
              value={(table.getColumn(filterColumnKey)?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn(filterColumnKey)?.setFilterValue(event.target.value)
              }
              className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 outline-none"
            />
          </div>
        </div>
        {option}
        <ReloadButton />
      </div>

      <div className="mt-2 max-w-4xl rounded-xl overflow-hidden border border-gray-700">
        <Table
          className="w-full table-fixed bg-[#1a2841]"
          style={{
            borderCollapse: "separate",
            borderSpacing: 0,
          }}
        >
          <colgroup>
            {columns.map((column) => (
              <col
                key={(column as any).id || (column as any).accessorKey}
                className={(column.meta as any)?.widthClass || 'w-auto'}
              />
            ))}
          </colgroup>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead className="text-lg text-white" key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())
                    }
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="bg-transparent hover:bg-[#22395f] transition"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="h-10 text-base whitespace-nowrap overflow-hidden text-white bg-transparent [mask-image:linear-gradient(to_right,black_75%,transparent_100%)]"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-white bg-transparent">
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
