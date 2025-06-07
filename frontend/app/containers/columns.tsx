"use client"
 
import { ColumnDef } from "@tanstack/react-table"
import { ContainerInfo } from "./page"
import { TimeAgo } from "@/components/TimeAgo"
import { NameTag } from "@/components/common/NameTag"

export const getContainerColumns = (
  onNameClick: (container: ContainerInfo) => void
) : ColumnDef<ContainerInfo>[] => [
  {
    accessorKey: "name",
    header: "Name",
    meta: {
      widthClass: "w-[30%]"
    },
    cell: ({ row }) => {
      const container = row.original;
      return (
        <NameTag 
          name={container.name}
          email={container.userEmail}
          onClick={() => onNameClick(container)} 
        />
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
        //console.log(date);
        return <TimeAgo timestamp={date} />
    }
  },
]