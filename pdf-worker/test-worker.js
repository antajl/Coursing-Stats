const testUrl = 'https://coursing-stats-pdf-worker.antajltube.workers.dev/api/process-pdf';
const testPdfUrl = 'https://rkf.online/static/files/reports/100552.pdf';

async function testWorker() {
  try {
    console.log('Testing worker with PDF:', testPdfUrl);

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
    console.log('Response:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('✅ PDF processing successful!');
      console.log('Pages:', result.pages);
      console.log('Method:', result.method);
      console.log('Text length:', result.text?.length);
      console.log('First 200 chars:', result.text?.substring(0, 200));
    } else {
      console.log('❌ PDF processing failed:', result.error);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testWorker();
