export const printElement = (element: HTMLElement, title: string) => {
  // Open a new window
  const win = window.open('', '_blank', 'height=800,width=800');
  
  if (!win) {
    alert('Please allow popups to print this document.');
    return;
  }

  // Clone the element to get HTML
  const content = element.outerHTML;

  // Get Tailwind script
  const tailwindScript = '<script src="https://cdn.tailwindcss.com"></script>';
  
  // Try to find the config script
  let configScript = '';
  const scripts = document.querySelectorAll('script');
  for (const script of scripts) {
    if (script.textContent && script.textContent.includes('tailwind.config')) {
      configScript = `<script>${script.textContent}</script>`;
      break;
    }
  }

  // Get Google Fonts
  const fonts = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
    .filter(link => link.href.includes('fonts.googleapis.com'))
    .map(link => link.outerHTML)
    .join('');

  win.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        ${fonts}
        ${tailwindScript}
        ${configScript}
        <style>
          body { margin: 0; padding: 0; background: white; }
          @media print {
            @page { margin: 0; size: auto; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div style="width: 210mm; margin: 0 auto;">
          ${content}
        </div>
        <script>
          window.onload = () => {
            // Give Tailwind a moment to process classes
            setTimeout(() => {
              window.print();
            }, 1000);
          };
        </script>
      </body>
    </html>
  `);
  
  win.document.close();
  win.focus();
};
