import { FrameWaitForFunctionOptions, KeyInput, KnownDevices, PuppeteerLifeCycleEvent, Protocol } from "puppeteer";

export type CodeInput = string;
export type FunctionInput = string;
export type StringInput = string;
export type NumberInput = string;
export type NonRefrencable<T> = T;
export type EnumInput<T> = T;
export type RefrenceName = string;
export type RefrenceInput = `@${RefrenceName}`;

type ActionBase<Type, Config> = {
  name: RefrenceName,
  type: Type,
  config: Config,
}

export type NewPageAction = ActionBase<'newPage', {
  device?: EnumInput<keyof typeof KnownDevices>,
  timezone?: StringInput,
}>


export type GoAction = ActionBase<'go', {
  page: RefrenceInput,
  url: StringInput,
}>

export type GoBackAction = ActionBase<'goBack', {
  page: RefrenceInput,
}>

export type GoForwardAction = ActionBase<'goForward', {
  page: RefrenceInput,
}>

export type WaitForFunctionAction = ActionBase<'waitForFunction', {
  page: RefrenceInput,
  function: FunctionInput,
  timeout?: NumberInput,
  polling?: EnumInput<FrameWaitForFunctionOptions['polling']>,
}>

export type WaitForNavigationAction = ActionBase<'waitForNavigation', {
  page: RefrenceInput,
  timeout?: NumberInput,
  waitUntil?: EnumInput<PuppeteerLifeCycleEvent>,
}>

export type WaitForSelectorAction = ActionBase<'waitForSelector', {
  page: RefrenceInput,
  selector: StringInput,
  timeout?: NumberInput,
}>

export type SleepAction = ActionBase<'sleep', {
  timeout?: NumberInput,
}>

export type QuerySelectorAction = ActionBase<'querySelector', {
  page: RefrenceInput,
  selector: StringInput,
}>

export type QuerySelectorAllAction = ActionBase<'querySelectorAll', {
  page: RefrenceInput,
  selector: StringInput,
}>

export type FocusAction = ActionBase<'focus', {
  page: RefrenceInput,
  element: RefrenceInput,
}>

export type TypeAction = ActionBase<'type', {
  page: RefrenceInput,
  content: StringInput,
}>

export type PressAction = ActionBase<'press', {
  page: RefrenceInput,
  key: KeyInput,
}>

export type ExecAction = ActionBase<'exec', {
  page?: RefrenceInput,
  function: FunctionInput,
  args: RefrenceInput[],
}>

export type InjectScriptTagAction = ActionBase<'injectScriptTag', {
  page: RefrenceInput,
  content?: CodeInput,
  url?: StringInput,
  id?: StringInput,
  type?: StringInput,
}>

export type InjectStyleTagAction = ActionBase<'injectStyleTag', {
  page: RefrenceInput,
  content?: CodeInput,
}>

export type SetCookieAction = ActionBase<'setCookie', {
  page: RefrenceInput,
  cookies?: NonRefrencable<Protocol.Network.CookieParam[]>, // TODO: make it refrencable?
}>

export type ConditionAction = ActionBase<'condition', {
  page?: RefrenceInput,
  function: FunctionInput,
  args: RefrenceInput[],
  then: RefrenceName,
  else: RefrenceName,
}>


export type FinishAction = ActionBase<'finish', {
  page?: RefrenceInput,
  response: RefrenceInput,
}>

// emit?

export type Action =
  NewPageAction | SleepAction |
  GoAction | GoBackAction | GoForwardAction |
  WaitForFunctionAction | WaitForNavigationAction | WaitForSelectorAction |
  QuerySelectorAction | QuerySelectorAllAction |
  FocusAction | TypeAction | PressAction | ExecAction |
  InjectScriptTagAction | InjectStyleTagAction |
  SetCookieAction |
  ConditionAction | FinishAction
;

export type Refrences = { [key: RefrenceName]: unknown };