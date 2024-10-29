import { Weather, WEATHER_ICONS_PATHS, WEATHER_LABELS } from "@/models/races";

const WeatherSummary: React.FC<{weather: Weather, air_temperature: number, track_temperature: number}> = ({weather, air_temperature, track_temperature}) => {
  return (
    <div className="flex gap-1">
      <div className="rounded-md color-button flex p-1 items-center">
        <img className="w-4 h-4 filter-foreground mr-1" src={WEATHER_ICONS_PATHS[weather]}/>
        <p>{WEATHER_LABELS[weather]}</p>
      </div>
      <div className="rounded-md color-button flex p-1 items-center">
        <img className="w-4 h-4 filter-foreground mr-1" src={'/media/icons/air.svg'}/>
        <p>{air_temperature}</p>
      </div>
      <div className="rounded-md color-button flex p-1 items-center">
        <img className="w-4 h-4 filter-foreground mr-1" src={'/media/icons/road.svg'}/>
        <p>{track_temperature}</p>
      </div>
    </div>
  );
};

export default WeatherSummary;

