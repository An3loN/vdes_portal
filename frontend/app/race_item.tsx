'use client';
import WeatherSummary from "@/components/weather_summary";
import { ParsedRace } from "@/models/races";
import { formatDate } from "@/utils/date_formats";
import { useRouter } from "next/navigation";

// Компонент элемента списка
export const RaceItem: React.FC<{ race: ParsedRace }> = ({ race }) => {
    const router = useRouter();

    const handleClick = () => {
        // Переход по ссылке на основе ID элемента
        router.push(`/race/${race.id}`);
    };

    return (
        <div
        className="flex flex-col w-96 items-center p-1 color-panel shadow-md rounded-lg mb-4 cursor-pointer color-panel-hover transition"
        onClick={handleClick}
        >
        <img
            src={race.image_url}
            alt={race.title}
            className="w-full rounded-lg object-cover"
        />
        <div className="flex flex-col w-full">
            <h2 className="text-xl font-semibold text-center border-b-2 border-gray-800 min-h-16 mb-2">{race.title}</h2>
            <WeatherSummary weather={race.weather} air_temperature={race.air_temperature} track_temperature={race.track_temperature}/>
            <div className="flex justify-between">
                <p className="text-sm text-gray-500">{formatDate(race.date)}</p>
                <p className="text-sm text-gray-500">
                    Игроков: {race.total_players}/{race.total_capacity}
                </p>
            </div>
        </div>
        </div>
    );
};