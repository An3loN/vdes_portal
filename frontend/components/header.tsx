'use client'
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import { UserAuth } from '@/models/auth';
import { useRouter } from 'next/navigation';
// import { AuthContext } from '@/app/layout';

const steam_login_url = 'https://steamcommunity.com/openid/login?';

const Header: React.FC<{user_auth:UserAuth}> = ({user_auth}) => {
  const router = useRouter();
  const handleSteamLogin = async () => {
    try {
      // Запрос на бэкенд для редиректа к Steam OpenID
      const response = await axios.get('/api/auth/steam/?initial_url=' + window.location.href, {
        withCredentials: true,
       });
       const data = JSON.parse(response.data)
      if (data.redirect_url) {
        // Редирект на Steam авторизацию
        window.location.href = steam_login_url + data.redirect_url;
      }
    } catch (error) {
      console.error('Ошибка при авторизации через Steam:', error);
    }
  };
  return (
    <header className="color-bg p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Логотип */}
        <div>
          <button onClick={() => router.push('/')}>
            <Image
              src="https://static.tildacdn.com/tild3337-3339-4261-b536-656238613365/vdes_logo_simple.svg"
              alt="VDES Logo"
              width={150}
              height={50}
              className="object-contain"
            />
          </button>
        </div>

        {/* Ссылка для авторизации через Steam */}
        <div>
          {
            user_auth.is_authorized ?
            (
              <Link href={'/profile'}>
                {user_auth.steam_name}
              </Link> 
            )
            :
            (
            <button onClick={handleSteamLogin}>
                <Image
                  src="https://community.steamstatic.com/public/images/signinthroughsteam/sits_01.png"
                  alt="Sign in through Steam"
                  width={150}
                  height={50}
                  className="object-contain"
                />
            </button>
            )

          }
        </div>
      </div>
    </header>
  );
};

export default Header;