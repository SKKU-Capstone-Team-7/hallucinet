"use client";
import { ReloadButton } from "@/components/common/ReloadButtion";
import MainLayout from "@/components/MainLayout";
import { TimeAgo } from "@/components/TimeAgo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAppwriteClient, getCurrentUser } from "@/lib/appwrite";
import { backendFetch } from "@/lib/utils";
import { Account, Models } from "appwrite";
import { AlertCircleIcon, LucideSearch, Plus, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { columns } from "../dashboard/columns";
import { DataTable } from "@/components/ui/data-table";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { SubmitHandler, useForm } from "react-hook-form";

interface TeamUpdateInfo {
  name: string;
  octet1: string;
  octet2: string;
}

interface TeamInfo {
  name: string;
  subnet: string;
  octet1: number;
  octet2: number;
  total: number;
}

function LeaveButton() {

  return (<div className="shadow-sm max-w-lg mt-8 p-4 border border-red-300 rounded-md bg-red-50">
            <h3 className="text-xl font-medium mb-2">Leave Team</h3>
            <p className="mt-2 text-sm">
            Are you sure you want to leave this team? You’ll immediately lose access to all shared devices and containers.
            </p> 
            <div className="mt-6 flex justify-end">
            <Button className="w-28 bg-red-600 hover:bg-red-700 cursor-pointer">
              Leave Team
            </Button>
            </div>
          </div>);
}

function DeleteButton() {

  return (<div className="shadow-sm max-w-lg mt-8 p-4 border border-red-300 rounded-md bg-red-50">
            <h3 className="text-xl font-medium mb-2">Delete Team</h3>
            <p className="mt-2 text-sm">
            Before proceeding to delete your team, please be aware that this action is irreversible. This deletion can only be performed only if the team currently has no other members.
            </p> 
            <div className="mt-6 flex justify-end">
            <Button className="w-28 bg-red-600 hover:bg-red-700 cursor-pointer">
              Delete Team
            </Button>
            </div>
          </div>);
}

export default function SettingPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null,
  );
  const [team, setTeam] = useState<TeamInfo | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<TeamUpdateInfo>({
    defaultValues: {
      name: "",
      octet1: "",
      octet2: "",
      }
    });

  useEffect(() => {
    try {
      (async () => {
        const u = await getCurrentUser();
        setUser(u);
        setLoading(false);

        if (!loading && !user) {
          router.push("/login");
        }

        const account = new Account(getAppwriteClient());
        const jwt = (await account.createJWT()).jwt;

        // Check if user is in a team
        const meRes = await backendFetch("/users/me", "GET", jwt);
        const meJson = await meRes.json();
        const teams: string[] = meJson["teamIds"];
        if (teams.length == 0) {
          router.push("/onboarding");
        }

        // Get team info
        const teamRes = await backendFetch("/teams/me/", "GET", jwt);
        const teamJson: any = await teamRes.json();
        const parts = teamJson["ipBlock16"].split('.');

        setValue("name", teamJson["name"] || "");
        setValue("octet1", parts[0]);
        setValue("octet2", parts[1]);

        const team: TeamInfo = {
            name: teamJson["name"],
            subnet: teamJson["ipBlock16"],
            octet1: parseInt(parts[0]),
            octet2: parseInt(parts[1]),
            total: teamJson["total"],
        };
        setTeam(team);

        const payload = {
          teamId: teamJson["$id"],
          userId: meJson["$id"]
        }
        console.log(payload);
        const roleRes = await backendFetch("/users/role", "POST", jwt, JSON.stringify(payload)); 
        const roleJson: any = await roleRes.json();

        setRole(roleJson["roles"][0] ? roleJson["roles"][0] : "member");
      })();
    } catch (e) {
      console.log(e);
    }
  }, []);

  /*
  const onFormSubmit: SubmitHandler<TeamFormData> = async (formData) => {
    if (!user) {
      alert("User not authenticated.");
      return;
    }
    setLoading(true);
    try {
      const account = new Account(getAppwriteClient());
      const jwt = (await account.createJWT()).jwt;

      // 백엔드로 보낼 최종 subnet 문자열 구성
      const fullSubnet = `${formData.octet1}.${formData.octet2}.0.0/16`;
      
      const payload: TeamUpdateInfo = { // TeamUpdateInfo는 name, subnet을 가짐
        name: formData.name,
        subnet: fullSubnet,
      };

      console.log("Submitting to backend:", payload);
      await backendFetch("/teams/me/", "PUT", jwt, payload); // "PUT" 또는 "PATCH"
      
      alert("Team settings updated successfully!");

      // 성공 후 team state 업데이트 (선택적: 백엔드가 업데이트된 객체를 반환한다면 그것 사용)
      if (team) { // 이전 team state가 있을 경우를 대비
        setTeam({
          ...team, // 기존 total 등 다른 정보 유지
          name: payload.name,
          subnet: payload.subnet,
          octet1: parseInt(formData.octet1, 10),
          octet2: parseInt(formData.octet2, 10),
        });
      }

    } catch (e) {
      console.error("Failed to update team settings:", e);
      alert("Error updating settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  */

  if (loading) return <></>;

  return (
    <MainLayout user={user!}>
      <div className="ml-8">
        <div className="mt-18">
          <p className="text-2xl">Team Settings</p>
          <div className="mt-4 max-w-lg">
          <Alert>
            <AlertCircleIcon />
            <AlertTitle>Important Note</AlertTitle>
            <AlertDescription>
              Only the team owner can update or delete the team on this page.
            </AlertDescription>
          </Alert>
          </div>
          <div className="mt-8 gap-4 flex max-w-4xl shadow-sm max-w-lg p-4 border rounded-md">
            <form className="w-full">
              <div className="grid gap-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <label htmlFor="teamName" className="w-full sm:w-32 flex-shrink-0 mb-1 sm:mb-0">
                    Team name
                  </label>
                  <Input
                    id="teamName"
                    placeholder="Enter team name"
                    className="w-43 sm:w-43 sm:max-w-sm"
                    {...register("name")}
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <label htmlFor="subnetOctet1" className="w-full sm:w-32 flex-shrink-0 mb-1 sm:mb-0 pt-1">
                    Team subnet
                  </label>
                  <div className="flex items-center gap-1"> 
                    <Input
                      id="subnetOctet1"
                      type="tel"
                      className="w-14 text-center"
                      placeholder="XXX"
                      maxLength={3}
                      title="Please enter a number between 0 and 255."
                      inputMode="numeric"
                      {...register("octet1", {
                        pattern: {
                          value: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
                          message: "0-255"
                        }
                      })}
                    />
                    <span className="text-gray-600 text-lg font-medium">.</span>
                    <Input
                      id="subnetOctet2"
                      type="tel"
                      className="w-14 text-center"
                      placeholder="YYY"
                      maxLength={3}
                      title="Please enter a number between 0 and 255."
                      inputMode="numeric"
                      {...register("octet2", {
                        pattern: {
                          value: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
                          message: "0-255"
                        }
                      })}
                    />
                    <span className="text-gray-600 text-sm pt-px">.0.0/16</span> {/* pt-px for fine-tuning alignment */}
                  </div>
                </div>
              </div>
                
              <div className="flex justify-end">
                {role === "owner" ? <Button type="submit" className="mt-4 py-4 cursor-pointer">
                Update
              </Button> : <Button disabled type="submit" className="mt-4 py-4">
                Update
              </Button>}
              </div>
            </form>
          </div>
          <div>
          {role == null ? null : (
            role === "owner"
              ? <DeleteButton />   // owner일 때만 Delete
              : <LeaveButton />    // owner가 아니면 Leave
          )}
        </div>
        </div>
      </div>
    </MainLayout>
  );
}
