export const RaceStates = {
  Created: 'created',
  Started: 'started',
  Finished: 'finished',
};

export type Car = {
  class_name: string;
  name: string;
}

export type CarClass = {
  class_name: string;
  capacity: number;
  cars: string[];
}

export type ResultRow = {
  user: {
    steamid: string;
    name: string;
    surname: string;
  };
  race_number: number;
  car_class: string;
  car: string;
  lap_count: number;
  best_lap: number;
  place: number;
}

export type Results = {
  rows: Record<string, ResultRow>;
}

export type Weather = 'sunny' | 'cloudy' | 'rainy' | 'heavy_rain';

export type Race = {
  id: string;
  title: string;
  weather: Weather;
  track_temperature: number;
  air_temperature: number;
  description: string;
  date: string;
  image_url: string;
  race_finished: boolean;
  car_classes: Record<string, CarClass>;
  registrations: Record<string, Registration>;
  classes_registrations_count: Record<string, number>;
  results?: Results
}

export type ParsedRace = Race & {
  total_players: number;
  total_capacity: number;
  is_registered: boolean;
  user_registration?: Registration;
}

export type Registration = {
  steamid: string;
  car_class: string;
  car: string;
  race_number: number;
  name: string;
  surname: string;
}

export type User = {
  steamid: string;
  name: string;
  surname: string;
}

export const WEATHER_LABELS = {
  'sunny': 'Ясно',
  'cloudy': 'Облачно',
  'rainy': 'Дождь',
  'heavy_rain': 'Ливень',
}

export const WEATHER_ICONS_PATHS = {
  'sunny': 'media/icons/weather-sunny.svg',
  'cloudy': 'media/icons/weather-clody.svg',
  'rainy': 'media/icons/weather-rainy.svg',
  'heavy_rain': 'media/icons/weather-heavy_rain.svg',
}

export function parseRace(race: Race, user_id: string | undefined) : ParsedRace {
  let total_capacity = 0;
  Object.values(race.car_classes).forEach(car_class => total_capacity += car_class.capacity);
  let parsed_race = {
    ...race,
    total_players: Object.values(race.registrations).length,
    total_capacity: total_capacity,
  } as ParsedRace;
  if(user_id && Object.keys(race.registrations).includes(user_id)) {
    parsed_race.user_registration = race.registrations[user_id]
  }
  return parsed_race
}

export function get_reserved_numbers(race: Race) : number[] {
  return Object.values(race.registrations).map(registration => registration.race_number);
}

export function get_allowed_classes(race: Race, chosen_class = undefined) : CarClass[] {
  return Object.values(race.car_classes).filter(
    car_class => car_class.class_name == chosen_class ||
     car_class.capacity > race.classes_registrations_count[car_class.class_name]
    );
}