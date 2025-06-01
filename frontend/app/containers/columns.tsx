"use client"
 
import { ColumnDef } from "@tanstack/react-table"
import { ContainerInfo } from "./page"
import { TimeAgo } from "@/components/TimeAgo"
import { NameTag } from "@/components/common/NameTag"
 
export const columns: ColumnDef<ContainerInfo>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.getValue<string>("name");
      const email = row.original.userEmail;
      return (
                    <NameTag name={name} email={email} />
      )
    }
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