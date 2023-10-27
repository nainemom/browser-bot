import { Browser } from 'puppeteer';
import { Action } from './types';
import { runAction } from './actions';

export const startBot = async (browser: Browser, actions: Action[]) => {
  console.log('Bot Started...');
  let context: {
    [key: string]: unknown,
  } = {};
  for (let index = 0; index < actions.length; index += 1) {
    const action = actions[index];
    console.log(`Running ${action.type}...`);
    context = await runAction(browser, action, context);
    console.log(`${action.type} Finished!`);
    const actionValue = context[action.name];

    if (action.type === 'finish') {
      return actionValue;
    } else if (action.type === 'condition') {
      const nextStep = actionValue as string;
      const nextIndex = actions.findIndex((actionItem) => actionItem.name === nextStep);
      index = nextIndex;
    }
  }
  return context;
}

export { createBrowser } from './actions';