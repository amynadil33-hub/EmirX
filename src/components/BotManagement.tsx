import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import BotCard from "./BotCard";

export default function BotManagement() {
  const [bots, setBots] = useState<any[]>([]);

  useEffect(() => {
    async function loadBots() {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id;
      if (!uid) return;

      const { data, error } = await supabase
        .from("client_bots")
        .select("*")
        .eq("client_id", uid);

      if (!error && data) setBots(data);
      else console.error("❌ Error loading bots:", error?.message);
    }

    loadBots();
  }, []);

  if (!bots.length) {
    return <p>No bots assigned yet. Ask admin to add bots to your account.</p>;
  }

  return (
    <div className="grid gap-4">
      {bots.map((bot) => (
        <BotCard key={bot.bot_id} bot={bot} />
      ))}
    </div>
  );
}
