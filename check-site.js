const url = 'http://procoursing.ru/s_2026.html';

async function checkSite() {
  console.log('=== Checking headers for:', url);
  
  const response = await fetch(url, { method: 'HEAD' });
  
  console.log('Status:', response.status, response.statusText);
  console.log('Content-Type:', response.headers.get('content-type'));
  console.log('Server:', response.headers.get('server'));
  console.log('Date:', response.headers.get('date'));
  
  // Check for charset in Content-Type header
  const contentType = response.headers.get('content-type') || '';
  const charsetMatch = contentType.match(/charset=(.+)/i);
  if (charsetMatch) {
    console.log('Charset from header:', charsetMatch[1]);
  } else {
    console.log('No charset in Content-Type header');
  }
}

checkSite().catch(console.error);