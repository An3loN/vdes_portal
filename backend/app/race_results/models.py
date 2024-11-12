from operator import attrgetter
from typing import Awaitable, Callable, Coroutine, List, Optional, Self
from typing import Any
from dataclasses import dataclass

from pydantic import BaseModel, Field

from app.cars import car_names

class Car(BaseModel):
    carId: int
    raceNumber: int
    carModel: int
    cupCategory: int
    carGroup: str
    teamName: str
    nationality: int
    carGuid: int
    teamGuid: int
    drivers: List['Driver']
    ballastKg: Optional[int] = Field(default=0)

class CurrentDriver(BaseModel):
    firstName: str
    lastName: str
    shortName: str
    playerId: str

class Driver(BaseModel):
    firstName: str
    lastName: str
    shortName: str
    playerId: str

class Lap(BaseModel):
    carId: int
    driverIndex: int
    laptime: int
    isValidForBest: bool
    splits: List[int]

class LeaderBoardLine(BaseModel):
    car: Car
    currentDriver: CurrentDriver
    currentDriverIndex: int
    timing: 'Timing'
    missingMandatoryPitstop: int
    driverTotalTimes: List[float]

class ResultsInput(BaseModel):
    sessionType: str
    trackName: str
    sessionIndex: int
    raceWeekendIndex: int
    metaData: str
    serverName: str
    sessionResult: 'SessionResult'
    laps: List[Lap]
    penalties: List[object]
    post_race_penalties: List[object]

class SessionResult(BaseModel):
    bestlap: int
    bestSplits: List[int]
    isWetSession: int
    type: int
    leaderBoardLines: List[LeaderBoardLine]

class Timing(BaseModel):
    lastLap: int  # Может не быть?
    lastSplits: List[int]
    bestLap: int  # Может не быть?
    bestSplits: List[object]
    totalTime: int  # Может не быть?
    lapCount: int
    lastSplitId: object

class UserRowData(BaseModel):
    steamid: str
    name: str
    surname: str

class ResultRow(BaseModel):
    user: UserRowData
    race_number: int
    car_class: str
    car: str
    total_time: int
    lap_count: int
    best_lap: int
    place: Optional[int] = None

def player_id_to_steam_id(player_id: str) -> str:
    return player_id[1:]

class Results(BaseModel):
    rows: dict[str, ResultRow]

    @classmethod
    def from_result_input(cls, results_input: ResultsInput) -> Self:
        results = [ResultRow(
            user=UserRowData(
                steamid=player_id_to_steam_id(leaderboard_line.currentDriver.playerId),
                name=leaderboard_line.currentDriver.firstName,
                surname=leaderboard_line.currentDriver.lastName,
            ),
            race_number=leaderboard_line.car.raceNumber,
            car_class=leaderboard_line.car.carGroup,
            car=car_names[leaderboard_line.car.carModel] if leaderboard_line.car.carModel in car_names else 'Unknown car',
            total_time=leaderboard_line.timing.totalTime,
            lap_count=leaderboard_line.timing.lapCount,
            best_lap=leaderboard_line.timing.bestLap,
        ) for leaderboard_line in results_input.sessionResult.leaderBoardLines]
        results.sort(key=attrgetter('total_time'))
        results.sort(key=attrgetter('lap_count'), reverse=True)
        for i, _ in enumerate(results):
            results[i].place = i + 1
        return Results(rows={result.user.steamid:result for result in results})