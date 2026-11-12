import { Socket } from "phoenix";
import DOMPatch from "phoenix_live_view/dom_patch";
import LiveSocket from "phoenix_live_view/live_socket";
import { simulateJoinedView } from "../test_helpers";

describe("autoplay video patching", () => {
  let liveSocket: LiveSocket;

  afterEach(() => {
    liveSocket.destroyAllViews();
    document.body.innerHTML = "";
    jest.restoreAllMocks();
  });

  test("handles a rejected play() on an added autoplay video", async () => {
    document.body.innerHTML = `
      <div data-phx-session="abc123" data-phx-root-id="root" data-phx-static="456" id="root">
        <div id="content"></div>
      </div>
    `;
    liveSocket = new LiveSocket("/live", Socket);
    const view = simulateJoinedView(
      document.getElementById("root")!,
      liveSocket,
    );
    const container = document.getElementById("content")!;

    const play = jest
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockImplementation(() =>
        Promise.reject(
          new DOMException("The operation was aborted.", "AbortError"),
        ),
      );

    const source = document.createElement("div");
    source.innerHTML = `<video id="player" autoplay></video>`;
    new DOMPatch(view, container, source, new Set(), null).perform(false);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(play).toHaveBeenCalledTimes(1);
  });
});
