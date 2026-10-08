import { describe, expect, test } from "vitest";
import {
  contentSchema,
  isSafeUrl,
  videoEmbed,
  isVideoUrl,
} from "../src/lib/schema";
import { seed, validateFile } from "../src/lib/backend";
describe("Content and safe rendering", () => {
  test("preserves all 5 jobs, 9 courses and source dates", () => {
    expect(contentSchema.parse(seed).experiences).toHaveLength(5);
    expect(seed.certificates).toHaveLength(9);
    expect(seed.experiences[0]).toMatchObject({
      company: "Nexo International",
      period: "05/2025 — atual",
    });
    expect(seed.videos).toHaveLength(0);
    expect(seed.profile.photo).toBe("");
  });
  test.each([
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "//evil.example",
    "http://example.org",
    "/../private",
    "https://user:pass@example.org",
  ])("rejects unsafe link %s", (value) => expect(isSafeUrl(value)).toBe(false));
  test("allows secure and bundled assets", () => {
    expect(isSafeUrl("https://example.org/photo.jpg")).toBe(true);
    expect(isSafeUrl("/assets/photo.jpg")).toBe(true);
  });
  test("only embeds approved video providers", () => {
    expect(videoEmbed("https://youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    );
    expect(
      videoEmbed("https://youtube.com.evil.org/watch?v=dQw4w9WgXcQ"),
    ).toBeNull();
    expect(videoEmbed("https://vimeo.com/123456")).toBe(
      "https://player.vimeo.com/video/123456",
    );
    expect(isVideoUrl("https://example.org/file.mp4")).toBe(true);
    expect(isVideoUrl("https://example.org/index.html")).toBe(false);
  });
  test("rejects executable file uploads and enforces limits", () => {
    expect(() =>
      validateFile(
        new File(["x"], "attack.svg", { type: "image/svg+xml" }),
        "image",
      ),
    ).toThrow();
    expect(() =>
      validateFile(
        new File([new Uint8Array(5 * 1024 * 1024 + 1)], "large.png", {
          type: "image/png",
        }),
        "image",
      ),
    ).toThrow("5 MB");
    expect(
      validateFile(
        new File(["test"], "portrait.jpg", { type: "image/jpeg" }),
        "image",
      ),
    ).toBe("jpg");
  });
});
