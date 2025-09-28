import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function BotManagement() {
  const [bots, setBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadBots() {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id;
      if (!uid) return;

      const { data, error } = await supabase
        .from("client_bots")
        .select("*")
        .eq("client_id", uid);

      if (!error) setBots(data || []);
      else console.error("❌ Error loading bots:", error.message);

      setLoading(false);
    }

    loadBots();
  }, []);

  if (loading) return <p>Loading bots...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Bots</h1>

      {bots.length === 0 ? (
        <p className="text-gray-600">
          No bots assigned yet. Please contact support to add bots to your
          account.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bots.map((bot) => (
            <div
              key={bot.bot_id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 flex flex-col justify-between"
            >
              <div>
                <div className="text-3xl">🤖</div>
                <h2 className="text-lg font-semibold mt-2">{bot.name}</h2>
                <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                  {bot.greeting}
                </p>
              </div>

              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => navigate(`/bots/${bot.bot_id}`)}
                  className="flex-1 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition"
                >
                  Manage
                </button>
                <a
                  href={`/bot-chat.html?bot_id=${bot.bot_id}&name=${encodeURIComponent(
                    bot.name
                  )}&greeting=${encodeURIComponent(bot.greeting)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200 transition text-center"
                >
                  Chat
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
