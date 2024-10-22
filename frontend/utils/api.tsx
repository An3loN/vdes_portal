import { UserAuth } from "@/models/auth";
import axios from "axios";
import { parseSetCookie, ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";

const is_admin_url = 'http://backend:8000/api/is_admin';

export async function is_admin() {
  let is_admin = false;
    try {
        const response = await axios.get(is_admin_url, { headers: {Cookie: "login="+cookies().get('login')?.value} });
        const data = response.data as {is_admin: boolean};
        if (data.is_admin) {
          is_admin = data.is_admin;
        }
      } catch (error) {
        console.error(error);
      }
    return is_admin;
}

const is_authorized_url = 'http://backend:8000/api/is_authorized';

export async function is_authorized() {
  let is_authorized = false;
    try {
        const response = await axios.get(is_authorized_url, { headers: {Cookie: "login="+cookies().get('login')?.value} });
        const data = response.data as {is_authorized: boolean, user_data?: UserAuth};
        if (data.is_authorized) {
          is_authorized = data.is_authorized;
        }
      } catch (error) {
        console.error(error);
      }
    return is_authorized;
}

const is_registered_url = 'http://backend:8000/api/is_registered';

export async function is_registered() {
  let is_registered = false;
    try {
        const response = await axios.get(is_registered_url, { headers: {Cookie: "login="+cookies().get('login')?.value} });
        const data = response.data as {is_registered: boolean};
        if (data.is_registered) {
          is_registered = data.is_registered;
        }
      } catch (error) {
        console.error(error);
      }
    return is_registered;
}

const get_user_auth_url = 'http://backend:8000/api/user_auth';

export async function get_user_auth() {
  let user_auth:UserAuth = {is_authorized: false};
  try {
      const response = await axios.get(get_user_auth_url, { headers: {Cookie: "login="+cookies().get('login')?.value+",refresh="+cookies().get('refresh')?.value }, withCredentials: true });
      const set_cookies = response.headers["set-cookie"];
      let cookie: ResponseCookie | undefined;
      if(set_cookies && set_cookies[0]) {
        cookie = parseSetCookie(set_cookies[0]);
      }
      user_auth = JSON.parse(response.data) as UserAuth;
      if(cookie) {
        user_auth.refresh_time = Number(cookie.maxAge);
      }
    } catch (error) {
      console.error(error);
    }
    return user_auth;
}