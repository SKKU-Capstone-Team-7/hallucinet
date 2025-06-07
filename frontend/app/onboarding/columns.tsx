"use client"
 
import { ColumnDef } from "@tanstack/react-table"
import { InvitationInfo } from "./page"
import { Account } from "appwrite"
import { getAppwriteClient } from "@/lib/appwrite"
import { backendFetch } from "@/lib/utils"
import { Check, X } from "lucide-react"
import { NameTag } from "@/components/common/NameTag"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { useState } from "react"
import { toast } from "sonner"
 
export const getInvitationColumns = (
  refreshInvitations: () => Promise<void>,
  navigateTo: AppRouterInstance["push"],
): ColumnDef<InvitationInfo>[] => [
  {
    accessorKey: "senderName",
    header: "Name",
    meta: {
      widthClass: "w-[35%]"
    },
    cell: ({ row }) => {
      const name = row.original.senderName;
      const email = row.original.senderEmail;
      return <NameTag name={name} email={email} />;
    }
  },
  {
    accessorKey: "invitation_time",
    header: "Invitation Date",
    meta: {
      widthClass: "w-[35%]"
    },
    cell:  ({ row }) => {
        const time = row.getValue<Date>("invitation_time");
        return (
            <div key={row.original.id}>
              {time.toLocaleString()}
            </div>
        );
    },
  },
  {
    accessorKey: "actions",
    header: "Select",
    meta: {
      widthClass: "w-[15%]"
    },
    cell: ({ row }) => {
        const id = row.original.id;
        const [isAccepting, setIsAccepting] = useState(false);
        const [isDeclining, setIsDeclining] = useState(false);

        const handleAccept = async () => {
          setIsAccepting(true);
          try {
            const account = new Account(getAppwriteClient());
            const jwt = (await account.createJWT()).jwt;
            const joinRes = await backendFetch(
              "/invitations/" + id + "/accept",
              "POST",
              jwt,
            );
                  
            if (joinRes.ok) {
              toast.success("Invitation Accepted!", {
                description: "Redirecting to your workspace...",
              });
              navigateTo("/dashboard");
              return;
            } else {
              console.log(await joinRes.json());
            }
          } catch (e) {
            console.error("Accept invitation exception:", e);
          } finally {
            setIsAccepting(false);
          }
        };

        const handleDecline = async () => {
          setIsDeclining(true);
          try {
            const account = new Account(getAppwriteClient());
            const jwt = (await account.createJWT()).jwt;
            const declineRes = await backendFetch(
              "/invitations/" + id + "/decline",
              "POST",
              jwt,
            );
                  
            if (declineRes.ok) {
              toast.info("Invitation Declined");
              await refreshInvitations();
            } else {
              console.log(await declineRes.json());
            }
          } catch (e) {
            console.error("Decline invitation exception:", e);
          } finally {
            setIsDeclining(false);
          }
        };

        return (
            <div className="flex mx-auto cursor-pointer">
              <Check onClick={handleAccept} className="mr-1" />
              <X onClick={handleDecline}/>
            </div>
        );
    }
  },
]