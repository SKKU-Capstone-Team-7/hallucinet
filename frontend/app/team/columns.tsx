"use client"
 
import { ColumnDef } from "@tanstack/react-table"
import { UserInfo } from "./page"
import { TimeAgo } from "@/components/TimeAgo"
import { Trash2 } from 'lucide-react';
import { NameTag } from "@/components/common/NameTag";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export const getColumns = (userIsOwner: boolean): ColumnDef<UserInfo>[] => [
  {
    accessorKey: "name",
    header: "Name",
    meta: {
      widthClass: "w-[35%]"
    },
    cell: ({ row }) => {
      const name = row.getValue<string>("name");
      const email = row.original.email;
      return (
        <NameTag name={name} email={email} />
      )
    }
  },
  {
    accessorKey: "role",
    header: "Role",
    meta: {
      widthClass: "w-[25%]"
    },
  },
  {
    accessorKey: "joinedAt",
    header: "Joined",
    meta: {
      widthClass: "w-[20%]"
    },
    cell: ({ row }) => {
        const date = row.getValue<Date>("joinedAt");
        return <TimeAgo timestamp={date} />
    }
  },
  {
    accessorKey: "delete",
    header: "",
    meta: {
      widthClass: "w-[20%]"
    },
    cell: ({ row }) => {
      const role = row.original.role;
      return <div>{role == "owner" 
        ? <div></div>
        : (userIsOwner 
          ? <AlertDialog>
              <AlertDialogTrigger asChild>
                <div 
                  className={`cursor-pointer flex items-center gap-1.5 text-red-500`} 
                >
                  <Trash2 size="15">
                  </Trash2>
                  <p className="relative -top-0.3">Delete</p>
                </div>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[#1A2841] border-slate-700 border">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Team Member?</AlertDialogTitle>
                  <AlertDialogDescription className="text-white">
                    This will permanently remove the member from the team and revoke all their access. 
                    Are you sure you want to continue?
                  </AlertDialogDescription>
                </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel className="cursor-pointer bg-[#1A2841]">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction className="cursor-pointer" onClick={() => {}}>
                    Continue
                  </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        : <div className={`flex items-center gap-1.5 text-gray-400`}><Trash2 size="15"></Trash2><p className="cursor-not-allowed relative -top-0.3">Delete</p></div>)
      }</div>
    }
  }
]