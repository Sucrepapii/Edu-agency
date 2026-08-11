const apiKey = 'AIzaSyCelFyuZc1avsoi2JCNYg2Lz92Zgh-PO1I';

async function listModels() {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await response.json();
  const names = data.models.map(m => m.name);
  console.log(names.join('\n'));
}

listModels();
