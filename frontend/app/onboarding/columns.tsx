"use client"
 
import { ColumnDef } from "@tanstack/react-table"
import { InvitationInfo } from "./page"
import { TimeAgo } from "@/components/TimeAgo"
import { Account } from "appwrite"
import { getAppwriteClient } from "@/lib/appwrite"
import { backendFetch } from "@/lib/utils"
import { useRouter } from "next/router"
import { Check, X } from "lucide-react"
import { NameTag } from "@/components/common/NameTag"
 
export const columns: ColumnDef<InvitationInfo>[] = [
  {
    accessorKey: "senderName",
    header: "Name",
    cell: ({ row }) => {
      const name = row.original.senderName;
      const email = row.original.senderEmail;
      return (
              <NameTag name={name} email={email} />
            )
    }
  },
  {
    accessorKey: "invitation_time",
    header: "Invitation Date",
    cell:  ({ row }) => {
        const time = row.getValue<Date>("invitation_time");
        return (
            <div key={time.toLocaleString()}>
              {time.toLocaleString()}
            </div>
        )
    }
  },
  {
    accessorKey: "id",
    header: "Select",
    cell: ({ row }) => {
        const id = row.getValue<string>("id");

        const handleAccept = async () => {
            try {
                const account = new Account(getAppwriteClient());
                const jwt = (await account.createJWT()).jwt;
                const joinRes = await backendFetch(
                    "/invitations/" + id + "/accept",
                    "POST",
                    jwt,
                  );
                  
                if (joinRes.ok) {
                    window.location.href = "/dashboard";
                  } else {
                    console.log(await joinRes.json());
                  }
                } catch (e) {
                  console.log(e);
                }
        };

        const handleDecline = async () => {
            try {
                const account = new Account(getAppwriteClient());
                const jwt = (await account.createJWT()).jwt;
                const declineRes = await backendFetch(
                    "/invitations/" + id + "/decline",
                    "POST",
                    jwt,
                  );
                  
                if (declineRes.ok) {
                    window.location.href = "/onboarding";
                  } else {
                    console.log(await declineRes.json());
                  }
                } catch (e) {
                  console.log(e);
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