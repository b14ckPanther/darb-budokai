/**
 * Render on demand: no frame is drawn unless something asked for one. The render callback
 * returns true while it is still animating (camera move, embers), which schedules the next frame.
 * No Angular inside; the frame clock is injected so tests drive it.
 */
export class RenderScheduler {
  private handle: number | null = null;
  private disposed = false;

  constructor(
    private readonly raf: (cb: (t: number) => void) => number,
    private readonly cancel: (handle: number) => void,
    private readonly render: (t: number) => boolean,
  ) {}

  requestRender(): void {
    if (this.disposed || this.handle !== null) return;
    this.handle = this.raf((t) => this.frame(t));
  }

  dispose(): void {
    this.disposed = true;
    if (this.handle !== null) this.cancel(this.handle);
    this.handle = null;
  }

  private frame(t: number): void {
    this.handle = null;
    if (this.disposed) return;
    if (this.render(t)) this.requestRender();
  }
}
