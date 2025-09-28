import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function BotDetails() {
  const { id } = useParams(); // id = bot_id
  const [bot, setBot] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "customize" | "integrations">("chat");
  const [saving, setSaving] = useState(false);

  // Load bot data for this client
  useEffect(() => {
    async function loadBot() {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id;
      if (!uid) return;

      const { data, error } = await supabase
        .from("client_bots")
        .select("*")
        .eq("bot_id", id)
        .eq("client_id", uid)
        .single();

      if (!error) setBot(data);
    }
    if (id) loadBot();
  }, [id]);

  // ✅ Dynamic Aminos script injection
  useEffect(() => {
    if (activeTab === "chat" && bot?.bot_id) {
      console.log("⚡ Injecting Aminos for bot:", bot.bot_id);

      // Remove any existing Aminos script
      const old = document.querySelector('script[src*="aminos.ai/js/chat_plugin.js"]');
      if (old) old.remove();

      // Add fresh script with this bot_id
      const script = document.createElement("script");
      script.src = "https://app.aminos.ai/js/chat_plugin.js";
      script.setAttribute("data-bot-id", bot.bot_id);
      script.async = true;

      script.onload = () => {
        console.log("✅ Aminos script loaded for bot:", bot.bot_id);
        if ((window as any).Aminos) {
          console.log("⚡ Forcing Aminos init");
          (window as any).Aminos.init?.();
        }
      };

      document.head.appendChild(script);

      return () => {
        console.log("🧹 Cleaning up Aminos script on unmount");
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }
  }, [activeTab, bot?.bot_id]);

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
        <button
          className={`pb-2 ${activeTab === "chat" ? "border-b-2 border-blue-500" : ""}`}
          onClick={() => setActiveTab("chat")}
        >
          Chat
        </button>
        <button
          className={`pb-2 ${activeTab === "customize" ? "border-b-2 border-blue-500" : ""}`}
          onClick={() => setActiveTab("customize")}
        >
          Customize
        </button>
        <button
          className={`pb-2 ${activeTab === "integrations" ? "border-b-2 border-blue-500" : ""}`}
          onClick={() => setActiveTab("integrations")}
        >
          Integrations
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "chat" && (
        <div>
          <p className="text-gray-600 mb-4">{bot.greeting}</p>
          <p className="text-sm text-gray-500">
            Aminos chat bubble will appear bottom-right.
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
        <div>
          <p className="mb-2">Embed this bot on your website:</p>
          <pre className="bg-gray-100 p-2 rounded text-sm">
{`<script src="https://app.aminos.ai/js/chat_plugin.js" data-bot-id="${bot.bot_id}"></script>`}
          </pre>
        </div>
      )}
    </div>
  );
}
