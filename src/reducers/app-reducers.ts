import { ACTION_TYPES } from '../actions';
import { AppState } from '../models';
import moment from 'moment';
import { defaultAppState } from './default-states';

// App is also config but only relevant for the session

export const app = (state: AppState = defaultAppState, action) => {
  switch (action.type) {
  case ACTION_TYPES.CONFIG_FETCHED:
    return {
      ...state,
      invoiceFilters: Object.assign({}, state.invoiceFilters, {groupedByMonth: action.config.groupInvoiceListByMonth})
    };

  case ACTION_TYPES.INITIAL_LOAD:
    return {...state, isLoaded: true};

  case ACTION_TYPES.APP_BUSYTOGGLE: {
    const busyCount = state.busyCount + (action.why === 'moreBusy' ? 1 : -1);
    return {...state, busyCount, isBusy: busyCount > 0};
  }

  case ACTION_TYPES.APP_INVOICE_FILTERSUPDATED:
    return {...state, invoiceFilters: action.filter};

  case ACTION_TYPES.PDF_LOADED:
    return {...state, pdf: action.payload};

  default:
    return state;
  }
};