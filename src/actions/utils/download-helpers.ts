import InvoiceModel from '../../components/invoice/models/InvoiceModel';
import {buildUrl} from './fetch';

/** An interface you say? */
export function getDownloadUrl(
  fileType: 'quotation' | 'invoice' | 'client',
  _id: string,
  attachmentType: string,
  fileName: string, downloadType?: 'preview' | 'download',
): string {

  const query = downloadType === 'download' ? '?download=1' : '';
  return buildUrl(`/attachments/${fileType}/${_id}/${attachmentType}/${encodeURIComponent(fileName)}${query}`);
}


export function downloadAttachment(fileName: string, content: Blob): void {
  const link = document.createElement('a');
  link.download = fileName;
  const blobUrl = URL.createObjectURL(content);
  link.href = blobUrl;
  link.click();
}


export function invoiceReplacements(input: string, invoice: InvoiceModel): string {
  let str = input;

  const nrRegex = /\{nr:(\d+)\}/;
  const nrMatch = str.match(nrRegex);
  if (nrMatch) {
    const nrSize = Math.max(parseInt(nrMatch[1], 10), invoice.number.toString().length);
    str = str.replace(nrRegex, (`000000${invoice.number}`).slice(-nrSize));
  }

  str = str.replace(/\{nr\}/g, invoice.number.toString());

  const dateRegex = /\{date:([^}]+)\}/;
  const dateMatch = str.match(dateRegex);
  if (dateMatch && invoice.date) {
    const dateFormat = dateMatch[1];
    str = str.replace(dateRegex, invoice.date.format(dateFormat));
  }

  if (str.indexOf('{orderNr}') !== -1) {
    str = str.replace('{orderNr}', invoice.orderNr);
  }

  if (str.indexOf('{clientName}') !== -1) {
    str = str.replace('{clientName}', invoice.client.name);
  }

  // Object.keys(data).forEach(invoiceProp => {
  //   str = str.replace('{' + invoiceProp + '}', data[invoiceProp]);
  // });

  return str;
}

export function getInvoiceFileName(invoice: InvoiceModel): string {
  const {fileName} = invoice;
  return `${invoiceReplacements(fileName, invoice)}.pdf`;
}


export function previewPdf(fileName: string, content: Blob): void {
  try {
    const blobUrl = URL.createObjectURL(content);
    const previewWindow = window.open(blobUrl);
    if (previewWindow) {
      // These didn't work for setting the document.title
      // setTimeout(() => previewWindow.document.title = fileName, 3000);
      // previewWindow.document.write('<title>My PDF File Title</title>');

      // This would work for setting a document title but need to do some additional styling
      // previewWindow.document.write(`
      //   <html><head><title>Your Report Title</title></head><body height="100%" width="100%">
      //     <iframe src="' + blobUrl + '" height="100%" width="100%"></iframe>
      //   </body></html>`);
    }
  } catch (err) {
    console.error('previewPdf', err); // eslint-disable-line
  }
}

// ATTN: This doesn't really work once deployed
// function downloadBase64File(fileName: string, content: string): void {
//   var link = document.createElement('a');
//   link.download = fileName;
//   link.target = '_blank';
//   link.href = 'data:application/octet-stream;base64,' + content;
//   link.click();
// }



// ATTN: this solution doesn't work on Internet Exploder
// function openWindow(pdf: string, fileName: string): void {
//   // GET request /attachment that just returns the bytestream
//   // and then here:
//   //window.open('data:application/pdf,' + escape(pdf));
//   // (that could work right?)

//   // Does work on Chrome, Firefox and Chrome
//   var win = window.open('', '', '');
//   if (win && win.document) {
//     const html = `
//       <html>
//         <head>
//           <title>${fileName}</title>
//           <style>
//             * { margin:0; padding:0 }
//             body { margin:0; padding:0; text-align:center }
//             #hold_my_iframe { padding:0px; margin:0 auto; width:100%; height:100% }
//           </style>
//         </head>
//         <body>
//           <table border=0 cellspacing=0 cellpadding=0 id="hold_my_iframe">
//             <iframe src="${pdf}" width=100% height=100% marginwidth=0 marginheight=0 frameborder=0></iframe>
//           </table>
//         </body>
//       </html>`;

//     win.document.write(html);
//     win.document.title = fileName;

//   } else {
//     failure(t('controls.popupBlocker'), t('controls.popupBlockerTitle'), 8000);
//   }
// }