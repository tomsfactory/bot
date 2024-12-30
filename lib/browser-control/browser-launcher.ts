/**
 * A browser launcher
 */
export interface BrowserLauncher<Options, Browser> {
  /**
   * Launch the browser
   * @param options
   */
  launch(options?: Options): Promise<Browser>;
}
