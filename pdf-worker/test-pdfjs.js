const testUrl = 'https://coursing-stats-pdf-worker.antajltube.workers.dev/api/process-pdf';
const testPdfUrl = 'https://rkf.online/static/files/reports/94395.pdf'; // Совсем другой PDF

async function testWorker() {
  try {
    console.log('Testing worker with NEW PDF (94395):', testPdfUrl);

    const response = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pdfUrl: testPdfUrl
      })
    });

    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Cached:', result.cached);
    console.log('Success:', result.success);
    console.log('Method:', result.method);

    if (result.success) {
      console.log('✅ PDF processing successful!');
      console.log('Pages:', result.pages);
      console.log('Text length:', result.text?.length);
      if (result.text && result.text.length > 0) {
        console.log('First 500 chars:', result.text.substring(0, 500));
      } else {
        console.log('❌ Text is empty!');
      }
    } else {
      console.log('❌ PDF processing failed:', result.error);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testWorker();
