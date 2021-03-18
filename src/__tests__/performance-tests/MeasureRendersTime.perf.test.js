import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { perf } from 'react-performance-testing/native';
import "regenerator-runtime/runtime";

test('render time should be less than 80ms', async () => {
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

  const { renderTime } = perf(React);

  render(<Counter />);

  fireEvent.click(screen.getByRole('button', { name: /count/i }));

  await waitFor(() => {
    // 80ms is 300fps
    expect(renderTime.current.Counter.mount).toBeLessThan(80);
    expect(renderTime.current.Counter.updates[0]).toBeLessThan(80);
  });
});

test('should measure re-render time when state is updated from multiple components', async () => {
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

  const { renderTime } = perf(React);

  render(<Component />);

  fireEvent.click(screen.getByTestId('button'));

  await waitFor(() => {
    expect(renderTime.current.Counter[0].updates).toHaveLength(0);
    expect(renderTime.current.Counter[1].updates[0]).toBeLessThan(16);
    expect(renderTime.current.Counter[2].updates).toHaveLength(0);
  });
});