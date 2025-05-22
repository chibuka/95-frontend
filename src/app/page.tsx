"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user) {
          router.push("/auth/login");
          return;
        }

        setUser(data.user);
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Redirecting to login...</p>;

  return (
    <div>
      <button onClick={logout}>Logout</button>
      <div className="flex flex-col items-center p-9 min-h-screen">
        <div className="font-medium mb-[20rem] text-[80px]">
          Build Real Projects - Fu** off leetcode.
          <div className="flex items-center justify-center text-[15px]">
            Welcome back {user.user_metadata?.name}
          </div>
        </div>
        <div className="flex flex-row gap-7 text-[20px] text-blue-400 ">
          <Link href="/challenges/tcp_server">TCP Server</Link>
          <Link href="/challenges/tcp_server">P2P Protocol</Link>
          <a href="" className="hover:underline">
            Text Editor
          </a>
        </div>
        <div className="sticky top-[100vh]">
          Built by haters of leetcode - with ❤️
        </div>
      </div>
    </div>
  );
}
