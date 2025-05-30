"use client"
 
import { ColumnDef } from "@tanstack/react-table"
import { UserInfo } from "./page"
import { TimeAgo } from "@/components/TimeAgo"
 
export const columns: ColumnDef<UserInfo>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "joinedAt",
    header: "Joined",
    cell: ({ row }) => {
        const date = row.getValue<Date>("joinedAt");
        return <TimeAgo timestamp={date} />
    }
  },
]