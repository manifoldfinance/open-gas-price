
export interface BrowserConfig {
  /** Name of the browser. */
  name: BrowserName;
  /** Whether to run in headless mode. */
  headless: boolean;
  /** A remote WebDriver server to launch the browser from. */
  remoteUrl?: string;
  /** Launch the browser window with these dimensions. */
  windowSize: WindowSize;
  /** Path to custom browser binary. */
  binary?: string;
  /** Additional binary arguments. */
  addArguments?: string[];
  /** WebDriver default binary arguments to omit. */
  removeArguments?: string[];
  /** CPU Throttling rate. (1 is no throttle, 2 is 2x slowdown, etc). */
  cpuThrottlingRate?: number;
  /** Advanced preferences usually set from the about:config page. */
  preferences?: {[name: string]: string | number | boolean};
  /** Trace browser performance logs configuration */
  trace?: TraceConfig;
  /** Path to profile directory to use instead of the default fresh one. */
  profile?: string;
}

/**
 * Configuration to turn on performance tracing
 */
export interface TraceConfig {
  /**
   * The tracing categories the browser should log
   */
  categories: string[];

  /**
   * The directory to log performance traces to
   */
  logDir: string;
}

export interface WindowSize {
  width: number;
  height: number;
}