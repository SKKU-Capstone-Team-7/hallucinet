// app/dashboard/page.jsx
"use client";

import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { CirclePlus, RotateCcw } from 'lucide-react';
import "@/styles/Dashboard.css";

export default function DashboardPage() {
  const containers = [
    { name: "Messi",    tag: "traffic:2.11", host: "dev‑mac" },
    { name: "Neymar",   tag: "traffic:2.11", host: "dev‑mac" },
    { name: "Ronaldo",  tag: "traffic:2.11", host: "dev‑mac" },
    { name: "Valverde", tag: "traffic:2.11", host: "dev‑mac" },
    { name: "Suarez",   tag: "traffic:2.11", host: "dev‑mac" },
    { name: "Iniesta",  tag: "traffic:2.11", host: "dev‑mac" },
    { name: "Xavi",     tag: "traffic:2.11", host: "dev‑mac" },
    { name: "Pique",    tag: "traffic:2.11", host: "dev‑mac" },
  ];

  const devices = [
    { name: "dev‑mac", email: "nariveshere@gmail.com", subnet: "10.2.1.0/24", last: "Just Now", status: "offline" },
    { name: "dev‑mac", email: "nariveshere@gmail.com", subnet: "10.2.1.0/24", last: "Just Now", status: "online"  },
    { name: "dev‑mac", email: "nariveshere@gmail.com", subnet: "10.2.1.0/24", last: "Just Now", status: "offline" },
    { name: "dev‑mac", email: "nariveshere@gmail.com", subnet: "10.2.1.0/24", last: "Just Now", status: "online"  },
    { name: "dev‑mac", email: "nariveshere@gmail.com", subnet: "10.2.1.0/24", last: "Just Now", status: "offline" },
  ];

  return (
    <SidebarProvider>
      <div className="dashboard-layout">
        
        <AppSidebar />

        
        <div className="dashboard-main">
          <header className="dashboard-header">
            <SidebarTrigger />
          </header>

          
          <div className="dashboard-container">
            
            <section className="recent-containers">
              <h2>Recent Containers</h2>
              <div
                className="containers-list">
                {containers.map((c, i) => (
                  <div key={i} className="container-card">
                    <h3>{c.name}</h3>
                    <p>{c.tag}</p>
                    <p>{c.host}</p>
                  </div>
                ))}
              </div>
            </section>

            
            <section className="devices-section">
              <h2>Devices</h2>
              <div className="devices-controls">
                <input
                  type="text"
                  placeholder="Search"
                  className="search-input"
                />
                 <button className="btn invite-btn">
                  <CirclePlus />
                  Invite
                </button>
                <button className="btn refresh-btn">
                  <RotateCcw />
                  Refresh
                </button>
              </div>

              <table className="devices-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Assigned Subnet</th>
                    <th>Last Seen</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((d, i) => (
                    <tr key={i}>
                      <td>
                        <span
                          className={`status-dot ${d.status}`}
                        ></span>
                        <div className="device-name">{d.name}</div>
                        <div className="device-email">{d.email}</div>
                      </td>
                      <td>{d.subnet}</td>
                      <td>{d.last}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
