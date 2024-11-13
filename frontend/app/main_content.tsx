import { ParsedRace } from "@/models/races";
import { RaceItem } from "./race_item";


export const MainContent: React.FC<{ races: ParsedRace[] }> = ({races}) => {
  return (
    <div className="p-6 container">
        {/* Тут надо их по ценрту сделать и ограничить в ширине */}
      <div className="max-w-race-container flex flex-wrap gap-2"> 
        {races.sort((a, b) => Number(b.date) - Number(a.date)).map((race) => (
          <RaceItem key={race.id} race={race} />
        ))}
      </div>
    </div>
  );
};