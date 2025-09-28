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

  // Load bot info
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{bot.name}</h1>

      {/* Tabs */}
      <div className="flex space-x-6 border-b mb-6">
        <button
          className={`flex items-center gap-2 pb-3 ${
            activeTab === "chat"
              ? "border-b-2 border-blue-500 text-blue-600 font-medium"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("chat")}
        >
          💬 Chat
        </button>
        <button
          className={`flex items-center gap-2 pb-3 ${
            activeTab === "customize"
              ? "border-b-2 border-blue-500 text-blue-600 font-medium"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("customize")}
        >
          🎨 Customize
        </button>
        <button
          className={`flex items-center gap-2 pb-3 ${
            activeTab === "integrations"
              ? "border-b-2 border-blue-500 text-blue-600 font-medium"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("integrations")}
        >
          🔗 Integrations
        </button>
      </div>

      {/* Chat Tab */}
      {activeTab === "chat" && (
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-600 mb-4">{bot.greeting}</p>
          <a
            href={`/bot-chat.html?bot_id=${bot.bot_id}&name=${encodeURIComponent(
              bot.name
            )}&greeting=${encodeURIComponent(bot.greeting)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Open Chat
          </a>
          <p className="text-sm text-gray-400 mt-2">
            Opens a dedicated chat page for this bot.
          </p>
        </div>
      )}

      {/* Customize Tab */}
      {activeTab === "customize" && (
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
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
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === "integrations" && (
        <div className="bg-white rounded-xl shadow p-6 space-y-6">
          {/* Website Embed */}
          <div>
            <p className="mb-2 font-medium">Embed this bot on your website:</p>
            <pre className="bg-gray-100 p-2 rounded text-sm">{`<script src="https://app.aminos.ai/js/chat_plugin.js" data-bot-id="${bot.bot_id}"></script>`}</pre>
          </div>

          {/* Social Media & Marketing */}
          <div>
            <p className="mb-2 font-medium">
              Connect to WhatsApp, Facebook & Instagram:
            </p>
            <p className="text-gray-600 text-sm mb-2">
              This bot can also chat with your customers on social media and
              messaging apps. Supported channels include:
            </p>
            <ul className="list-disc ml-6 text-sm text-gray-700 mb-3">
              <li>WhatsApp Business</li>
              <li>Facebook Messenger</li>
              <li>Instagram DMs</li>
            </ul>
            <p className="text-gray-600 text-sm">
              Please contact our support team to activate social media
              integrations for your bot.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
