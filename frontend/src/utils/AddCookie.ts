import Cookies from 'js-cookie';

export function setCookie(name:string, value:string | boolean, days = 7) {
  Cookies.set(name, JSON.stringify(value), { expires: days });
}

export function getCookie(name:string) {
  const value = Cookies.get(name);
  try {
    return value !== undefined ? JSON.parse(value) : null;
  } catch {
    return value || null;
  }
}

export function deleteCookie(name:string) {
  Cookies.remove(name);
}