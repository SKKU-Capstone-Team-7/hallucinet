"use client"
 
import { ColumnDef } from "@tanstack/react-table"
import { ContainerInfo } from "./page"
import { TimeAgo } from "@/components/TimeAgo"
import { NameTag } from "@/components/common/NameTag"
 
export const columns: ColumnDef<ContainerInfo>[] = [
  {
    accessorKey: "name",
    header: "Name",
    meta: {
      widthClass: "w-[30%]"
    },
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
    meta: {
      widthClass: "w-[20%]"
    },
  },
  {
    accessorKey: "image",
    header: "Image",
    meta: {
      widthClass: "w-[20%]"
    },
  },
  {
    accessorKey: "ip",
    header: "Assigned Ip",
    meta: {
      widthClass: "w-[20%]"
    },
  },
  {
    accessorKey: "last_seen",
    header: "Last Seen",
    meta: {
      widthClass: "w-[20%]"
    },
    cell: ({ row }) => {
        const date = row.original.last_seen;
        console.log(date);
        return <TimeAgo timestamp={date} />
    }
  },
]