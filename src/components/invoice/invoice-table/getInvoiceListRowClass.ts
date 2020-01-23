import moment from 'moment';
import InvoiceModel from '../models/InvoiceModel';


export function getInvoiceListRowClass(invoice: InvoiceModel, invoicePayDays: number): string {
  const rowTableClassName = `table-${getInvoiceDueDateVariant(invoice, invoicePayDays)}`;
  return rowTableClassName;
}

/**
 * Gets the Bootstrap variant based on the Invoice due date
 */
export function getInvoiceDueDateVariant(
  invoice: InvoiceModel,
  invoicePayDays: number = 30,
): '' | 'danger' | 'warning' | 'primary' | 'info' {

  /** Danger: This many days overdue and not yet paid */
  const DangerDays = 10;
  /** Primary: Expiration date due in this many days. */
  const WatchDays = 5;

  if (invoice.verified) {
    return '';
  }

  if (invoice.isQuotation) {
    return '';
  }

  const payDate = moment(invoice.date).add(invoicePayDays, 'days');
  if (moment().isAfter(moment(payDate).add(DangerDays, 'days'))) {
    return 'danger';
  }

  if (moment().isAfter(payDate)) {
    return 'warning';
  }

  if (moment().isAfter(moment(payDate).subtract(WatchDays, 'days'))) {
    return 'primary';
  }

  return 'info';
}
