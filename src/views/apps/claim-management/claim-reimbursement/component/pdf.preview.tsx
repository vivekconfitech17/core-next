import React, { useState, useEffect } from 'react';

import Axios from 'axios';

const PdfReview = ({ url }: { url:any }) => {
  const [pdfBlob, setPdfBlob] = useState<any>(null);

  useEffect(() => {
    Axios.get(url, {
      responseType: 'arraybuffer',
      headers: {
        Authorization: `Bearer ${(window as any).getToken?.()}`,
      },
    })
      .then(response => {
        const blob = new Blob([response.data], { type: 'application/pdf' });

        setPdfBlob(blob);
      })
      .catch(error => {
        console.error('Error fetching PDF:', error);
      });
  }, [url]);

  if (pdfBlob) {
    return (
      <iframe
        src={URL.createObjectURL(pdfBlob)}
        title="Document PDF"
        style={{ width: '100%', height: '100%', overflow: 'hidden', border: 'none' }}

        // type="application/pdf"
        ></iframe>
    );
  } else {
    return <div>Loading PDF...</div>;
  }
};

export default PdfReview;
