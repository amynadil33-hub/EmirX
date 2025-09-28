import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import BotCard from "./BotCard";

export default function BotManagement() {
  const [bots, setBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBots() {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const uid = userData?.user?.id;
        console.log("Supabase UID:", uid);

        if (!uid) {
          setError("No logged in user");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("client_bots")
          .select("bot_id, name, greeting")
          .eq("client_id", uid);

        if (error) throw error;
        setBots(data || []);
      } catch (err: any) {
        console.error("❌ Error loading bots:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadBots();
  }, []);

  if (loading) return <p>Loading your bots...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (bots.length === 0) return <p>No bots assigned yet.</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Your Bots</h2>
      {bots.map((bot) => (
        <BotCard key={bot.bot_id} bot={bot} />
      ))}
    </div>
  );
}
