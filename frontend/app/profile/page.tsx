import React from 'react';
import Header from "@/components/header";
import { get_user_auth } from "@/utils/api";
import UserProfileForm from "./user_data_form";
import ReturnLink from '@/components/main_page_link';


export default async function Page() {
  const user_auth = await get_user_auth();
  return (
    <div>
      <Header user_auth={user_auth}/>
      <div className="flex flex-col items-center justify-center color-bg text-white">
        <div className='w-full max-w-md flex content-start'>
          <ReturnLink/>
        </div>
        <UserProfileForm user_auth={user_auth}/>
      </div>
    </div>
  );
}