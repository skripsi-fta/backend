import * as qrcode from 'qrcode';

export async function generateQRCode(data: string): Promise<string> {
  //   const encryptedData = await encodePassword(data);
  const encryptedData = data;

  //   qrcode.toString(encryptedData, function (err, code) {
  //     console.log(code);
  //   });

  return new Promise((resolve, reject) => {
    qrcode.toDataURL(encryptedData, (err, url) => {
      if (err) {
        reject(err);
      } else {
        resolve(url);
      }
    });
  });
}
