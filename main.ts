




export interface BrowserConfig {
    /** Name of the browser. */
    name: string;
    /** Whether to run in headless mode. */
    headless: boolean;
    /** A remote WebDriver server to launch the browser from. */
    remoteUrl?: string;
    /** Launch the browser window with these dimensions. */
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
    trace?: boolean;
    /** Path to profile directory to use instead of the default fresh one. */
    profile?: string;
  }

export class Deferred<T> {
  readonly promise: Promise<T>;
  resolve!: (value: T) => void;
  reject!: (error: Error) => void;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}


/** The kinds of intervals we can measure. */
export type Measurement =
  | CallbackMeasurement
  | PerformanceEntryMeasurement
  | ExpressionMeasurement;

export interface MeasurementBase {
  name?: string;
}

export interface CallbackMeasurement extends MeasurementBase {
    mode: 'callback';
  }
  
  export interface PerformanceEntryMeasurement extends MeasurementBase {
    mode: 'performance';
    entryName: string;
  }
  
  export interface ExpressionMeasurement extends MeasurementBase {
    mode: 'expression';
    expression: string;
  }
  
  export type CommandLineMeasurements = 'callback' | 'fcp' | 'global';
  
  export const measurements = new Set<string>(['callback', 'fcp', 'global']);

/**
 * Benchmark results for a particular measurement on a particular page, across
 * all samples.
 */
export interface BenchmarkResult {
  /**
   * Label for this result. When there is more than one per page, this will
   * contain both the page and measurement labels as "page [measurement]".
   */
  name: string;
  /**
   * The measurement that produced this result
   */
  measurement: Measurement;
  /**
   * A single page can return multiple measurements. The offset into the array
   * of measurements in the spec that this particular result corresponds to.
   */
  measurementIndex: number;
  /**
   * Millisecond measurements for each sample.
   */
  millis: number[];
  queryString: string;
  version: string;
  browser: BrowserConfig;
  userAgent: string;
  bytesSent: number;
}