import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function BotDetails() {
  const { id } = useParams(); // bot_id from URL
  const [bot, setBot] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    "chat" | "customize" | "integrations"
  >("chat");
  const [saving, setSaving] = useState(false);

  // Load bot info from Supabase
  useEffect(() => {
    async function loadBot() {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id;
      if (!uid || !id) return;

      const { data, error } = await supabase
        .from("client_bots")
        .select("*")
        .eq("bot_id", id)
        .eq("client_id", uid)
        .single();

      if (!error) setBot(data);
      else console.error("❌ Error loading bot:", error.message);
    }

    loadBot();
  }, [id]);

  async function saveChanges() {
    if (!bot) return;
    setSaving(true);

    const { error } = await supabase
      .from("client_bots")
      .update({
        name: bot.name,
        greeting: bot.greeting,
      })
      .eq("bot_id", bot.bot_id);

    if (error) console.error("❌ Save error:", error.message);
    setSaving(false);
  }

  if (!bot) return <p>Loading bot...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">{bot.name}</h2>

      {/* Tabs */}
      <div className="flex space-x-4 border-b mb-4">
        {["chat", "customize", "integrations"].map((tab) => (
          <button
            key={tab}
            className={`pb-2 ${
              activeTab === tab ? "border-b-2 border-blue-500" : ""
            }`}
            onClick={() => setActiveTab(tab as any)}
          >
            {tab[0].toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "chat" && (
        <div>
          <p className="text-gray-600 mb-4">{bot.greeting}</p>
          <a
            href={`/bot-chat.html?bot_id=${bot.bot_id}&name=${encodeURIComponent(
              bot.name
            )}&greeting=${encodeURIComponent(bot.greeting)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Open Chat
          </a>
          <p className="text-sm text-gray-400 mt-2">
            Opens a dedicated chat page for this bot.
          </p>
        </div>
      )}

      {activeTab === "customize" && (
        <div className="space-y-4">
          <input
            type="text"
            value={bot.name || ""}
            onChange={(e) => setBot({ ...bot, name: e.target.value })}
            className="border p-2 w-full rounded"
            placeholder="Bot name"
          />
          <textarea
            value={bot.greeting || ""}
            onChange={(e) => setBot({ ...bot, greeting: e.target.value })}
            className="border p-2 w-full rounded"
            placeholder="Greeting message"
          />
          <button
            onClick={saveChanges}
            disabled={saving}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}

      {activeTab === "integrations" && (
        <div className="space-y-6">
          {/* Website Embed*
