/* eslint-disable no-console */
import {SetStateAction} from 'react';
import request from 'superagent-bluebird-promise';
import {Dispatch} from 'redux';
import {buildUrl} from '../../actions/utils/buildUrl';
import {initialLoad} from '../../actions/initialLoad';
import {UserModel, Claim} from './models/UserModel';
import {getRoles} from '../../reducers/user-reducers';


interface IAuthService {
  loggedIn: () => boolean;
  login: (res: any, dispatch: Dispatch<any>, setState: React.Dispatch<SetStateAction<string | 'loggedIn'>>) => void;
  logout: () => void;
  getBearer: () => string;
  getTokenString: () => string | null;
  getToken: () => JwtModel | null;
  getUser: () => UserModel | null;
  getClaims: () => Claim[],
  refresh: () => void;
  /** In ms */
  refreshInterval: () => number;
  /** For redirecting to after login */
  entryPathname: string;
}

type JwtModel = {
  iat: number;
  exp: number;
  data: UserModel;
}


export const authService: IAuthService = {
  loggedIn: () => !!localStorage.getItem('jwt'),
  login: (res: any, dispatch: Dispatch<any>, setState: React.Dispatch<SetStateAction<string | 'loggedIn'>>) => {
    dispatch(authenticateUser(res, setState));
  },
  logout: () => {
    localStorage.removeItem('jwt');
  },
  getBearer: (): string => `Bearer ${localStorage.getItem('jwt')}`,
  getTokenString: (): string | null => localStorage.getItem('jwt'),
  getToken: (): JwtModel | null => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      return null;
    }
    return parseJwt(token);
  },
  getUser: (): UserModel | null => {
    const token = authService.getToken();
    if (!token) {
      return null;
    }
    return token.data;
  },
  getClaims: (): Claim[] => {
    const user = authService.getUser();
    if (!user) {
      return [];
    }
    const claims = getRoles()
      .filter(x => (user.roles || []).includes(x.name))
      .map(x => x.claims)
      .flat();

    return claims;
  },
  refresh: (): void => {
    refreshToken();
  },
  refreshInterval: () => (+(localStorage.getItem('jwtInterval') || (60 * 60)) * 1000),
  entryPathname: document.location.pathname,
};

function parseJwt(token: string): JwtModel {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
      .join(''),
  );

  return JSON.parse(jsonPayload);
}


function refreshToken(): void {
  request.post(buildUrl('/user/refresh'))
    .set('Content-Type', 'application/json')
    .set('Authorization', authService.getBearer())
    .set('Accept', 'application/json')
    .then(res => {
      console.log('refresh result', res.body);
      localStorage.setItem('jwt', res.body.jwt);
    })
    .catch(err => {
      console.log('refresh error', err);
    });
}



function authenticateUser(loginResponse: any, setState: React.Dispatch<SetStateAction<string | 'loggedIn'>>) {
  setState('');

  console.log('loginResponse', loginResponse);
  const idToken = loginResponse.tokenId; // TODO: Answer on laptop looked like this
  // const idToken = loginResponse.tc.id_token; // But on desktop it looked like this. wtf?
  return dispatch => {
    request.post(buildUrl('/user/login'))
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send({idToken})
      .then(res => {
        console.log('login result', res.body);
        localStorage.setItem('jwt', res.body.jwt);
        dispatch(initialLoad());
        setState('loggedIn');
      })
      .catch(err => {
        console.log('login error', err);
        authService.logout();
        // window.location.reload(false);
        setState((err.body && err.body.err) || 'Unknown error');
      });
  };
}
