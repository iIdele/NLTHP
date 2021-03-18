import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { perf } from 'react-performance-testing/native';
import "regenerator-runtime/runtime";

test('renders correct amount of times when state is updated', async () => {
  const Counter = () => {
    const [count, setCount] = React.useState(0);
    return (
      <div>
        <p>{count}</p>
        <button type="button" onClick={() => setCount((c) => c + 1)}>
          count
          </button>
      </div>
    );
  };
  const Component = () => {
    return <Counter />;
  };

  const { renderCount } = perf(React);

  render(<Component />);

  fireEvent.click(screen.getByRole('button', { name: /count/i }));

  await waitFor(() => expect(renderCount.current.Counter.value).toBe(2));
});

test('renders correct amount of times when state is updated for same Component', async () => {
  const Counter = ({ testid }) => {
    const [count, setCount] = React.useState(0);
    return (
      <div>
        <p>{count}</p>
        <button
          data-testid={testid}
          type="button"
          onClick={() => setCount((c) => c + 1)}
        >
          count
          </button>
      </div>
    );
  };
  const Component = () => {
    return (
      <div>
        <Counter />
        <Counter testid="button" />
        <Counter />
      </div>
    );
  };

  const { renderCount } = perf(React);

  render(<Component />);

  fireEvent.click(screen.getByTestId('button'));

  await waitFor(() => {
    expect(renderCount.current.Counter[0].value).toBe(1);
    expect(renderCount.current.Counter[1].value).toBe(2);
    expect(renderCount.current.Counter[2].value).toBe(1);
  });
});