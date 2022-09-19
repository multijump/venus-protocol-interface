import React from 'react';

import { userMarkets } from '__mocks__/models/userMarkets';
import renderComponent from 'testUtils/renderComponent';

import MarketBreakdown, { MarketBreakdownProps } from '.';
import TEST_IDS from './testIds';

jest.mock('clients/api');

const baseProps: MarketBreakdownProps = {
  market: userMarkets[0],
  includeXvs: true,
};

describe('pages/Account/MarketBreakdown', () => {
  it('renders without crashing', () => {
    renderComponent(<MarketBreakdown {...baseProps} />);
  });

  it.each([true, false])(
    'displays stats and tables correctly when includeXvs is %s',
    includeXvs => {
      const { getByTestId } = renderComponent(
        <MarketBreakdown {...baseProps} includeXvs={includeXvs} />,
      );

      expect(getByTestId(TEST_IDS.stats).textContent).toMatchSnapshot();
      expect(getByTestId(TEST_IDS.tables).textContent).toMatchSnapshot();
    },
  );
});
