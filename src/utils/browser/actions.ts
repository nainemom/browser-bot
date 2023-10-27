/* All action methods config field must be resolved before pass */

import puppeteer, { Browser, ElementHandle, KnownDevices, Page } from "puppeteer";
import { Action, Refrences, ConditionAction, ExecAction, FinishAction, FocusAction, GoAction, GoBackAction, InjectScriptTagAction, InjectStyleTagAction, NewPageAction, PressAction, QuerySelectorAction, QuerySelectorAllAction, SetCookieAction, SleepAction, TypeAction, WaitForFunctionAction, WaitForNavigationAction, WaitForSelectorAction } from "./types";

export const createBrowser = (): Promise<Browser> => {
  return puppeteer.launch({
    headless: 'new',
  });
}

const newPage = async (browser: Browser, config: NewPageAction['config']) => {
  const page = await browser.newPage();
  if (config.device) {
    await page.emulate(KnownDevices[config.device]);
  }
  if (config.timezone) {
    await page.emulateTimezone(config.timezone);
  }
  return page;
}

const go = (config: GoAction['config']) => {
  const page = config.page as unknown as Page;
  page.goto(config.url); // we no need to wait for load
  return config.url;
}

const goBack = (config: GoBackAction['config']) => {
  const page = config.page as unknown as Page;
  return page.goBack();
}

const goForward = (config: GoBackAction['config']) => {
  const page = config.page as unknown as Page;
  return page.goForward();
}

const sleep = (config: SleepAction['config']) => {
  return new Promise((resolve) => {
    setTimeout(resolve, parseInt(config.timeout || '0'));
  });
}

const waitForFunction = (config: WaitForFunctionAction['config']) => {
  const page = config.page as unknown as Page;
  return page.waitForFunction(config.function, {
    polling: config.polling,
    timeout: parseInt(config?.timeout || '0'),
  });
}

const waitForNavigation = (config: WaitForNavigationAction['config']) => {
  const page = config.page as unknown as Page;
  return page.waitForNavigation({
    waitUntil: config.waitUntil,
    timeout: parseInt(config?.timeout || '0'),
  });
}

const waitForSelector = (config: WaitForSelectorAction['config']) => {
  const page = config.page as unknown as Page;
  return page.waitForSelector(config.selector, {
    timeout: parseInt(config?.timeout || '0'),
  });
}

const querySelector = (config: QuerySelectorAction['config']) => {
  const page = config.page as unknown as Page;
  return page.evaluateHandle((selector) => document.querySelector(selector), config.selector);
}

const querySelectorAll = (config: QuerySelectorAllAction['config']) => {
  const page = config.page as unknown as Page;
  // return page.$$(config.selector);
  return page.evaluateHandle((selector) => document.querySelectorAll(selector), config.selector);
}

const focus = (config: FocusAction['config']) => {
  const page = config.page as unknown as Page;
  /* @ts-ignore */
  return page.evaluateHandle((element) => element.focus(), config.element as unknown as ElementHandle);
}

const type = (config: TypeAction['config']) => {
  const page = config.page as unknown as Page;
  return page.keyboard.type(config.content, {
    delay: Math.floor(Math.random() * 20),
  });
}

const press = (config: PressAction['config']) => {
  const page = config.page as unknown as Page;
  return page.keyboard.press(config.key, {
    delay:  Math.floor(Math.random() * 20),
  });
}

const exec = (config: ExecAction['config']) => {
  const page = config.page as unknown as Page || undefined;
  if (page) {
    console.log(`   Executing ${config.function} into page`);
    // return page.evaluate(config.function, ...config.args);
    return page.evaluate(eval(config.function), ...config.args);
  }
  return eval(config.function)(...config.args);
}

const injectScriptTag = (config: InjectScriptTagAction['config']) => {
  const page = config.page as unknown as Page;
  return page.addScriptTag({
    ...config,
  });
}

const injectStyleTag = (config: InjectStyleTagAction['config']) => {
  const page = config.page as unknown as Page;
  return page.addStyleTag({
    ...config,
  });
}

const setCookie = (config: SetCookieAction['config']) => {
  const page = config.page as unknown as Page;
  return page.setCookie(...(config.cookies || []));
}

const condition = async (config: ConditionAction['config']) => {
  const page = config.page as unknown as Page | undefined;
  let result = false;
  if (typeof page !== 'undefined') {
    result = !!(await exec({
      args: config.args,
      function: config.function,
      page,
    } as unknown as ExecAction['config']));
  } else {
    result = !!(await eval(config.function)(...config.args));
  }
  return result ? config.then : config.else;
}

const finish = async (config: FinishAction['config']) => { // TODO
  const page = config.page as unknown as Page | undefined;
  if (page) {
    await page.close();
  }
  return config.response;
}

type ResolvableConfig = object | string | boolean | [];

const resolveRefrences = <T = ResolvableConfig>(input: T, refrences: Refrences = {}): T => {
  if (input && Array.isArray(input)) {
    const response: unknown[] = [];
    input.forEach((value) => {
      response.push(resolveRefrences(value, refrences));
    });
    return response as T;
  } else if (input && typeof input === 'object') {
    const response: { [key: string]: unknown } = {};
    Object.entries(input).forEach(([key, value]) => {
      response[key] = resolveRefrences(value, refrences);
    });
    return response as T;
  } else if (typeof input === 'string' && input.startsWith('@') && Object.keys(refrences).includes(input.slice(1))) { // directly poiunted to a refrence
    return refrences[input.slice(1)] as T;
  }
  // its pointed to refrences in middle of content
  let newInput = input as string;
  Object.entries(refrences).forEach(([key, value]) => {
    newInput = newInput.split(`@${key}`).join(value ? value.toString() : 'undefined');
  });
  return newInput as T;
}

export const runAction = async <T, R extends Refrences>(browser: Browser, rawAction: Action, refrences: R): Promise<R & {
  [key in Action['name']]: T
}> => {
  let actionValue = undefined;
  const action = resolveRefrences(rawAction, refrences);

  if (action.type === 'newPage') {
    actionValue = await newPage(browser, action.config);
  } else {
    const actionsMethods = {
      go,
      goBack,
      goForward,
      sleep,
      waitForFunction,
      waitForNavigation,
      waitForSelector,
      querySelector,
      querySelectorAll,
      focus,
      type,
      press,
      exec,
      injectScriptTag,
      injectStyleTag,
      setCookie,
      condition,
      finish,
    };
    /* @ts-ignore */
    actionValue = await actionsMethods[action.type](action.config);
  }

  return {
    ...refrences,
    [action.name]: actionValue as T,
  };
}