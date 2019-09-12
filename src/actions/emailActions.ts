import request from 'superagent-bluebird-promise';
import InvoiceModel from "../components/invoice/models/InvoiceModel";
import { EmailModel } from "../components/controls/email/EmailModels";
import { buildUrl } from './utils/fetch';
import { success, failure } from './appActions';
import { Attachment } from '../models';
import { t } from '../components/util';
import { invoiceReplacements } from './downloadActions';
import { ACTION_TYPES } from './utils/ActionTypes';

export function sendEmail(invoice: InvoiceModel, email: EmailModel) {
  return dispatch => {
    email.attachments = email.attachments.map(attachmentType => {
      const details = invoice.attachments.find(a => a.type === attachmentType) as Attachment;
      if (attachmentType === 'pdf') {
        return {
          type: 'pdf',
          fileName: invoiceReplacements(invoice.fileName, invoice) + '.pdf',
          fileType: 'application/pdf',
        };
      }
      return {
        type: attachmentType,
        fileName: details.fileName,
        fileType: details.fileType,
      } as any;
    });

    request.post(buildUrl(`/invoices/email/${invoice._id}`))
      .send(email)
      .then(res => {
        console.log('res', res);
        success(t('email.sent'));
        dispatch({
          type: ACTION_TYPES.INVOICE_EMAILED,
          payload: {
            _id: invoice._id,
            lastEmail: res.body
          }
        })
      })
      .catch(err => {
        console.error('res ERROR', err);
        failure(err.body[0].message, 'Email failure', 8000);
      });
  }
}