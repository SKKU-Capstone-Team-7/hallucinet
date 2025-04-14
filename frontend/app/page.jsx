'use client'; 

import Link from "next/link";
import "../styles/landing.css"; 

export default function Landing() {
  return (
    <div className="landing-page">
      <div className="landing-container">
      <h1 className="landing-title">Hallucinet,<br/>What You've Waited for</h1>
        <p className="landing-subtitle">
        In modern software development, many teams have multiple members using various devices, each running several Docker containers.
        It makes developers deal with complex tasks like setting up VPNs, forwarding ports, and preventing IP conflicts, all while trying to remember which container runs where and what it does.
        These challenges slow down development and lead to errors such as incorrect port mappings or IP clashes, making it harder for teams to work together efficiently.
        One simple solution is needed to securely link Docker containers across different devices and make access straightforward.
        Team members should be able to see the state of containers and devices at a glance, without getting stuck in complicated network setups.
        Hallucinet proposes this project to address these challenges.
        </p>

        <div className="landing-buttons">
          <Link href="/login" className="landing-btn login">Sign In</Link>
          <Link href="/register" className="landing-btn register">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
