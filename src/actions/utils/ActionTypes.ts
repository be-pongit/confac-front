
export enum ACTION_TYPES {
  INITIAL_LOAD = 'INITIAL_LOAD',
  APP_BUSYTOGGLE = 'APP_BUSYTOGGLE',
  APP_INVOICE_FILTERSUPDATED = 'APP_INVOICE_FILTERSUPDATED',
  APP_PROJECT_FILTERUPDATED = 'APP_PROJECT_FILTERUPDATED',

  CONFIG_FETCHED = 'CONFIG_FETCHED',
  CONFIG_UPDATE = 'CONFIG_UPDATE',

  CLIENTS_FETCHED = 'CLIENTS_FETCHED',
  CLIENT_UPDATE = 'CLIENT_UPDATE', // client inserts are also done with update

  INVOICES_FETCHED = 'INVOICES_FETCHED',
  INVOICE_DELETED = 'INVOICE_DELETED',
  INVOICE_ADDED = 'INVOICE_ADDED',
  INVOICE_UPDATED = 'INVOICE_UPDATED',
  INVOICE_EMAILED = 'INVOICE_EMAILED',

  CONSULTANTS_FETCHED = 'CONSULTANTS_FETCHED',
  CONSULTANT_UPDATE = 'CONSULTANT_UPDATE',

  PROJECTS_FETCHED = 'PROJECTS_FETCHED',
  PROJECT_UPDATE = 'PROJECT_UPDATE'
};
