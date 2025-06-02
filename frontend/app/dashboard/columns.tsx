"use client"
 
import { ColumnDef } from "@tanstack/react-table"
import { DeviceInfo } from "./page"
import { Dot } from 'lucide-react';
import { TimeAgo } from "@/components/TimeAgo"
import { NameTag } from "@/components/common/NameTag"
 
export const columns: ColumnDef<DeviceInfo>[] = [
    {
    accessorKey: "status",
    header: "",
    cell: ({ row }) => {
      //console.log(row.original);
        const date = row.original.last_activate;

        console.log(date);
        console.log("this time:");
        console.log(new Date());
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
    size: 150,
    cell: ({ row }) => {
      const name = row.getValue<string>("name");
      const email = row.original.userEmail;
      return (
              <NameTag name={name} email={email} />
            )
    }
  },
  {
    accessorKey: "subnet",
    header: "Assigned Subnet",
    size: 150,
  },
  {
    accessorKey: "last_activate",
    header: "Last Activated",
    size: 150,
    cell: ({ row }) => {
        const date = row.original.last_activate;
        return <TimeAgo timestamp={date} />
    }
  },
]