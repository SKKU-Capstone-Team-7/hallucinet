"use client"
 
import { ColumnDef } from "@tanstack/react-table"
import { UserInfo } from "./page"
import { TimeAgo } from "@/components/TimeAgo"
import { Trash2 } from 'lucide-react';

export const getColumns = (userIsOwner: boolean): ColumnDef<UserInfo>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.getValue<string>("name");
      const email = row.original.email;
      return (
        <div>
          <div>{name}</div>
          <small style={{ color: "#777"}}>{email}</small>
        </div>
      )
    }
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
  {
    accessorKey: "delete",
    header: "",
    cell: ({ row }) => {
      const role = row.original.role;
      return <div>{role == "owner" 
        ? <div></div>
        : (userIsOwner ? <div className={`flex items-center gap-1.5 text-red-500`}><Trash2 size="15"></Trash2><p className="cursor-pointer relative -top-0.3" onClick={() => {}}>Delete</p></div> 
        : <div className={`flex items-center gap-1.5 text-gray-400`}><Trash2 size="15"></Trash2><p className="cursor-not-allowed relative -top-0.3">Delete</p></div>)
      }</div>
    }
  }
]