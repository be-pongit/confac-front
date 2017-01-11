import request from 'superagent-bluebird-promise';

import { ACTION_TYPES } from './ActionTypes.js';
import { buildUrl, catchHandler } from './fetch.js';
import { addNotification as notify } from 'reapop';
import t from '../trans.js';

// https://github.com/LouisBarranqueiro/reapop/blob/master/docs/api.md#customize-default-values-for-notifications
export const notifySettings = {
  status: 'success',
  position: 'br',
  dismissible: true,
  dismissAfter: 2000,
  closeButton: false,
  allowHTML: false,
};
export function success(msg) {
  return notify({
    status: 'success',
    title: t('toastrSuccessTitle'),
    message: msg
  });
}
export function failure() {
  return notify({
    status: 'error',
    position: 'tc',
    dismissAfter: 4000,
    title: t('toastrFailureTitle'),
    message: t('toastrFailure'),
  });
}



export function busyToggle() {
  return {type: ACTION_TYPES.APP_BUSYTOGGLE};
}



export function updateConfig(newConfig) {
  return dispatch => {
    dispatch(busyToggle());
    return request.post(buildUrl('/config'))
      .set('Content-Type', 'application/json')
      .send(newConfig)
      .then(() => dispatch(success(t('config.popupMessage'))))
      .catch(catchHandler)
      .then(() => dispatch(busyToggle()));
  };
}
