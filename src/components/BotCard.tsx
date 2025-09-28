import { useNavigate } from "react-router-dom";

export default function BotCard({ bot }: { bot: any }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/bot/${bot.bot_id}`)}
      className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 shadow-sm mb-3"
    >
      <p className="font-semibold text-lg">{bot.name || "Unnamed Bot"}</p>
      <p className="text-sm text-gray-600">{bot.greeting || "No greeting set"}</p>
      <p className="text-xs text-gray-400">Bot ID: {bot.bot_id}</p>
    </div>
  );
}
