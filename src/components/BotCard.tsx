import { Link } from "react-router-dom";

export default function BotCard({ bot }: { bot: any }) {
  return (
    <div className="border rounded p-4 shadow">
      <h3 className="font-bold text-lg mb-2">{bot.name}</h3>
      <p className="text-gray-600 mb-4">{bot.greeting}</p>

      <Link
        to={`/bots/${bot.bot_id}`}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Open Bot
      </Link>
    </div>
  );
}
