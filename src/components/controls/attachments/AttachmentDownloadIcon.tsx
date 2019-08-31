import React from 'react';
import {Icon} from '../Icon';
import { getInvoiceDownloadUrl, getClientDownloadUrl} from '../../../actions/index';
import t from '../../../trans';
import InvoiceModel, { InvoiceModelProps } from '../../invoice/models/InvoiceModel';
import { ClientModel } from '../../client/models/ClientModels';
import { Attachment, IAttachment } from '../../../models';
import { getAwesomeFileType } from '../../invoice/models/getAwesomeFileType';


export const InvoiceDownloadIcon = ({invoice, ...props}: InvoiceModelProps) => (
  <AttachmentDownloadIcon
    model={invoice}
    attachment={invoice.attachments.find(a => a.type === 'pdf') as Attachment}
    modelType={invoice.isQuotation ? 'quotation' : 'invoice'}
    {...props}
  />
);


export const InvoicePreviewIcon = ({invoice, ...props}: InvoiceModelProps) => {
  const fileType = invoice.isQuotation ? 'quotation' : 'invoice';
  return <Icon title={t(fileType + '.viewPdf')} href={getInvoiceDownloadUrl(invoice, 'pdf')} fa="far fa-eye" {...props} />;
};




type AttachmentDownloadIconProps = {
  model: IAttachment,
  attachment: Attachment,
  modelType: 'invoice' | 'client' | 'quotation',
  label?: string, // TODO: Does this even do anything?
}


export const AttachmentDownloadIcon = ({model, attachment, modelType, ...props}: AttachmentDownloadIconProps) => {
  let href;
  if (modelType === 'client') {
    href = getClientDownloadUrl(model as ClientModel, attachment);
  } else {
    href = getInvoiceDownloadUrl(model as InvoiceModel, attachment.type, 'download');
  }

  return (
    <Icon
      fa={`${getAwesomeFileType(attachment)} fa-2x`}
      title={t('invoice.downloadAttachment', {type: attachment.fileName || attachment.type})}
      {...props}
      href={href}
      labelStyle={{fontSize: 16}}
    />
  );
}