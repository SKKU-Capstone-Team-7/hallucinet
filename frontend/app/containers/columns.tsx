"use client"
 
import { ColumnDef } from "@tanstack/react-table"
import { ContainerInfo } from "./page"
import { TimeAgo } from "@/components/TimeAgo"
 
export const columns: ColumnDef<ContainerInfo>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "deviceName",
    header: "Device",
  },
  {
    accessorKey: "image",
    header: "Image",
  },
  {
    accessorKey: "ip",
    header: "Assigned Ip",
  },
  {
    accessorKey: "last_seen",
    header: "Last Seen",
    cell: ({ row }) => {
        const date = row.getValue<Date>("last_seen");
        return <TimeAgo timestamp={date} />
    }
  },
]