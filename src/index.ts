import { default as createExpressApp, Request, Response } from 'express';
import { createBrowser, startBot } from './utils/browser';

const startApp = async () => {
  const app = createExpressApp();
  const port = process.env.PORT || 8000;
  const browser = await createBrowser();

  app.get('/example', async (_req: Request, res: Response) => {
    const response = await startBot(browser, [
      {
        type: 'newPage',
        config: {
          device: 'iPhone 12 Pro',
          timezone: 'Asia/Tehran'
        },
        name: 'page'
      },
      {
        type: 'go',
        config: {
          page: '@page',
          url: 'https://www.time.ir/',
        },
        name: 'pageContents',
      },
      {
        type: 'waitForNavigation',
        config: {
          page: '@page',
          waitUntil: 'domcontentloaded',
          timeout: '20000',
        },
        name: 'navComplete',
      },
      {
        type: 'querySelector',
        config: {
          page: '@page',
          selector: '.randomQuote',
        },
        name: 'qouteElement',
      },
      {
        type: 'exec',
        config: {
          page: '@page',
          args: ['@qouteElement'],
          function: '(el) => el.innerText',
        },
        name: 'qouteContent',
      },
      {
        type: 'finish',
        config: {
          response: '@qouteContent',
        },
        name: 'finish',
      },
    ]);
    res.json(response);
  });


  app.listen(port, () => {
    console.log(`The bot fired on :${port}`);
  });
}

startApp();
