"use client"
 
import { ColumnDef } from "@tanstack/react-table"
import { DeviceInfo } from "./page"
import { TimeAgo } from "@/components/TimeAgo"
 
export const columns: ColumnDef<DeviceInfo>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "subnet",
    header: "Assigned Subnet",
  },
  {
    accessorKey: "last_seen",
    header: "Last Activated",
    cell: ({ row }) => {
        const date = row.getValue<Date>("last_seen");
        return <TimeAgo timestamp={date} />
    }
  },
]