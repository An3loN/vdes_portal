import EditForm from "@/app/admin/race/[raceId]/edit_race_form";
import { Race } from "@/models/races";
import axios, { AxiosError } from "axios";
import { PageNotFoundError } from "next/dist/shared/lib/utils";
import { cookies } from "next/headers";


const get_race_url = 'http://backend:8000/api/admin/race/get/'

export type ResponseData = Race;

export default async function Page({ params }: { params: { raceId: string } }) {
    let race;
    try {
        const response = await axios.get(get_race_url + params.raceId, { headers: {Cookie: "login="+cookies().get('login')?.value} });
        race = JSON.parse(response.data) as ResponseData;
        if(!race) {
            throw PageNotFoundError;
        }
    } catch (error) {
        if(error instanceof AxiosError){
          return (<h1>{(error as AxiosError).request.data}</h1>)
        }
        else if (error instanceof Error) {
          return (<h1>{(error as Error).message}</h1>)
        }
        else return <h1>Something went wrong.</h1>;
      }
    return (
    <div className='flex justify-center items-center mt-10'>
        <div className="max-w-2xl">
            <EditForm race={race}/>
        </div>
    </div>
    )
}
  