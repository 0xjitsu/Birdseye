import { fireEvent, render, screen } from "@testing-library/react-native";

import App from "./App";

jest.mock("./src/components/GuideCamera", () => {
  const React = require("react");
  const { Pressable, Text, View } = require("react-native");

  return {
    GuideCamera: ({ onAdvance, pack }: { onAdvance(): void; pack: { title: string } }) =>
      React.createElement(
        View,
        { accessibilityLabel: `Guide for ${pack.title}` },
        React.createElement(Text, null, pack.title),
        React.createElement(
          Pressable,
          {
            accessibilityLabel: "Finish test guide",
            accessibilityRole: "button",
            onPress: onAdvance,
          },
          React.createElement(Text, null, "finish"),
        ),
      ),
  };
});

describe("Birdseye app", () => {
  it("moves from the lobby through waves, rewards, and back to the lobby", async () => {
    await render(<App />);

    expect(screen.getByText("Ori is ready\nto make something.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Start Paper Crane" })).toBeTruthy();

    await fireEvent.press(screen.getByRole("button", { name: "Start Paper Crane" }));
    expect(screen.getByLabelText("Guide for Paper Crane")).toBeTruthy();

    for (let wave = 0; wave < 4; wave += 1) {
      await fireEvent.press(screen.getByRole("button", { name: "Finish test guide" }));
      expect(screen.getByText("LEVEL UP!")).toBeTruthy();
      await fireEvent.press(screen.getByRole("button", { name: "Choose Precision Guide" }));
      expect(screen.getByLabelText("Guide for Paper Crane")).toBeTruthy();
    }

    await fireEvent.press(screen.getByRole("button", { name: "Finish test guide" }));
    expect(screen.getByText("You did it!")).toBeTruthy();

    await fireEvent.press(screen.getByRole("button", { name: "Claim rewards" }));
    expect(screen.getByText("The Crane")).toBeTruthy();
  });
});
