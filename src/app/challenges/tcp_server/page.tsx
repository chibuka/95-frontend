// Dashboard component
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";
import { User } from "@supabase/supabase-js";

const TEMPLATE_OWNER = "chibuka";
const TEMPLATE_REPO = "TCP_Server";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [forking, setForking] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Error fetching user:", error);
          router.push("/login");
          return;
        }
        console.log("debug user: ", data);
        setUser(data.user);
      } catch (error) {
        console.error("Unexpected error:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const forkProject = async () => {
    setForking(true);

    try {
      const { data, error } = await supabase.auth.getSession();
      console.log("debug token: ", data);

      if (error) {
        alert("Error getting session. Please re-login.");
        setForking(false);
        return;
      }

      /*
      This should be added in the CI workflow.
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    */
      const githubToken = process.env.GITHUB_TOKEN;
      // const githubToken = data.session?.provider_token;

      if (!githubToken) {
        alert("GitHub token not available. Please re-login.");
        setForking(false);
        return;
      }

      // First, verify the repository exists
      const repoCheckRes = await fetch(
        `https://api.github.com/repos/${TEMPLATE_OWNER}/${TEMPLATE_REPO}`,
        {
          headers: {
            Authorization: `token ${githubToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (!repoCheckRes.ok) {
        const errorText = await repoCheckRes.text();
        if (repoCheckRes.status === 404) {
          alert(
            `Repository '${TEMPLATE_OWNER}/${TEMPLATE_REPO}' not found. Please check the repository name.`
          );
        } else {
          alert(`Cannot access repository: ${errorText}`);
        }
        setForking(false);
        return;
      }

      const res = await fetch("/api/fork", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          githubToken,
          templateOwner: TEMPLATE_OWNER,
          templateRepo: TEMPLATE_REPO,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to fork repository");
      }

      const forkData = await res.json();

      if (forkData.forkedUrl) {
        router.push(`${forkData.forkedUrl}/tree/main`);
      } else {
        throw new Error("No forked URL returned");
      }
    } catch (error: any) {
      console.error("Fork error:", error);
      alert(`Fork failed: ${error.message}`);
    } finally {
      setForking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Please log in to continue.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-9 min-h-screen text-center">
      <h1 className="font-medium mb-12 text-[60px] leading-tight">
        Build your own TCP Server.
      </h1>
      <button
        onClick={forkProject}
        disabled={forking}
        className="cursor-pointer"
      >
        {forking ? "Forking..." : "Start Challenge"}
      </button>
    </div>
  );
}
