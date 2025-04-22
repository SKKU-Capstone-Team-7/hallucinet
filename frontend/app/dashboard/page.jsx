// Dashboard.jsx
import { Home, Folder, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", icon: Home, href: "#" },
  { name: "Projects", icon: Folder, href: "#" },
  { name: "Settings", icon: Settings, href: "#" },
];

export default function Dashboard() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col p-4 space-y-4">
        <h2 className="text-2xl font-bold mb-6">MyApp</h2>
        {navItems.map((item) => (
          <Button
            key={item.name}
            variant="ghost"
            className="justify-start text-left text-white hover:bg-gray-800"
          >
            <item.icon className="w-5 h-5 mr-2" />
            {item.name}
          </Button>
        ))}
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-100 p-6 overflow-auto">
        <h1 className="text-3xl font-semibold mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Visitors: 1,234</p>
              <p>Signups: 98</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1">
                <li>Deployed new update</li>
                <li>Fixed login issue</li>
                <li>Updated pricing page</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Remember to follow up with the design team about the new
                mockups.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
