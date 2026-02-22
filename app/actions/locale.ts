'use server';

import { cookies } from 'next/headers';

export async function setLocale(locale: 'en' | 'pt-BR') {
  const cookieStore = await cookies();
  cookieStore.set('locale', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
}
