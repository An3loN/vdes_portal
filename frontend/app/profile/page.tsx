import React from 'react';
import Header from "@/components/header";
import { get_user_auth } from "@/utils/api";
import UserProfileForm from "./user_data_form";


export default async function Page() {
  const user_auth = await get_user_auth();
  return (
    <div>
      <Header user_auth={user_auth}/>
      <UserProfileForm user_auth={user_auth}/>
    </div>
  );
}