'use client';
import { ParsedRace, Race } from "@/models/races";
import { formatDate } from "@/utils/date_formats";
import { useRouter } from 'next/navigation'

// Компонент элемента списка
const RaceItem: React.FC<{ race: ParsedRace }> = ({ race }) => {
    const router = useRouter();

    const handleClick = () => {
        // Переход по ссылке на основе ID элемента
        router.push(`/race/${race.id}`);
    };

    return (
        <div
        className="flex items-center p-4 color-panel shadow-md rounded-lg mb-4 cursor-pointer color-panel-hover transition"
        onClick={handleClick}
        >
        <img
            src={race.image_url}
            alt={race.title}
            className="max-h-20 rounded-lg mr-4 object-cover"
        />
        <div className="flex-1">
            <h2 className="text-xl font-semibold">{race.title}</h2>
            <p className="text-sm text-gray-500">{formatDate(race.date)}</p>
            <p className="text-sm text-gray-500">
            Игроков: {race.total_players}/{race.total_capacity}
            </p>
        </div>
        </div>
    );
};

// Главный блок страницы
export const MainContent: React.FC<{ races: ParsedRace[] }> = ({races}) => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {races.map((race) => (
        <RaceItem key={race.id} race={race} />
      ))}
    </div>
  );
};