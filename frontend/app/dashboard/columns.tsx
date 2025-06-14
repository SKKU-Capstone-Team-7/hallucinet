"use client"
 
import { ColumnDef } from "@tanstack/react-table"
import { DeviceInfo } from "./page"
import { Dot } from 'lucide-react';
import { TimeAgo } from "@/components/TimeAgo"
import { NameTag } from "@/components/common/NameTag"

export const getDeviceColumns = (
  onNameClick: (device: DeviceInfo) => void
) : ColumnDef<DeviceInfo>[] => [
  {
    accessorKey: "status",
    header: "",
    meta: {
      widthClass: "w-[5%]"
    },
    cell: ({ row }) => {
      //console.log(row.original);
      const date = row.original.last_activate;

      const timeDiff = new Date().getTime() - date.getTime();

      //console.log(timeDiff);
      let dotColorClass;
        
      if (timeDiff >= 0 && timeDiff <= 100 * 1000 ) {
        dotColorClass = "text-green-500 fill-green-500";
      } else {
        dotColorClass = "text-red-500 fill-red-500";
      }

      return (
        <div className="w-1 relative">
          <Dot className={`absolute top-1/2 left-1/2 -translate-x-1/3 -translate-y-1/2 ${dotColorClass}`} size={50}/>
        </div>
      )
    }
  },
  {
    accessorKey: "name",
    header: "Name",
    meta: {
      widthClass: "w-[30%]"
    },
    cell: ({ row }) => {
      const device = row.original;
      //console.log(device);
      return (
        <NameTag 
          onClick={() => onNameClick(device)}
          name={device.name} 
          email={device.userEmail}
        />
      )
    }
  },
  {
    accessorKey: "subnet",
    header: "Assigned Subnet",
    meta: {
      widthClass: "w-[35%]"
    },
  },
  {
    accessorKey: "last_activate",
    header: "Last Activated",
    meta: {
      widthClass: "w-[30%]"
    },
    cell: ({ row }) => {
      const date = row.original.last_activate;
      return <TimeAgo timestamp={date} />
    }
  },
]