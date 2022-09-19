/** @jsxImportSource @emotion/react */
import { Typography } from '@mui/material';
import { Cell, CellGroup, Icon } from 'components';
import React, { useMemo } from 'react';
import { useTranslation } from 'translation';
import { Market } from 'types';
import { formatCentsToReadableValue } from 'utilities';

import { markets } from '__mocks__/models/markets';
import useUpdateBreadcrumbNavigation from 'hooks/useUpdateBreadcrumbNavigation';

import Table from './Table';
import { useStyles } from './styles';

export interface MarketPageUiProps {
  market: Market;
  isIsolatedLendingMarket: boolean;
  totalSupplyCents: number;
  totalBorrowCents: number;
  description: string;
}

export const MarketPageUi: React.FC<MarketPageUiProps> = ({
  market,
  isIsolatedLendingMarket,
  totalSupplyCents,
  totalBorrowCents,
  description,
}) => {
  const styles = useStyles();
  const { t, Trans } = useTranslation();

  useUpdateBreadcrumbNavigation(
    currentPathNodes =>
      currentPathNodes.concat([
        {
          dom: market.name,
        },
      ]),
    [],
  );

  const cells: Cell[] = useMemo(
    () => [
      {
        label: t('market.header.totalSupplyLabel'),
        value: formatCentsToReadableValue({
          value: totalSupplyCents,
        }),
      },
      {
        label: t('market.header.totalBorrowLabel'),
        value: formatCentsToReadableValue({
          value: totalBorrowCents,
        }),
      },
      {
        label: t('market.header.availableLiquidityLabel'),
        value: formatCentsToReadableValue({
          value: totalSupplyCents - totalBorrowCents,
        }),
      },
      {
        label: t('market.header.assetsLabel'),
        value: market.assets.length,
      },
    ],
    [totalSupplyCents, totalBorrowCents, market.assets.length],
  );

  return (
    <>
      <div css={styles.header}>
        <Typography variant="small2" component="div" css={styles.headerDescription}>
          {description}
        </Typography>

        <CellGroup cells={cells} />
      </div>

      {isIsolatedLendingMarket && (
        <div css={styles.banner}>
          <div css={styles.bannerContent}>
            <Icon name="attention" css={styles.bannerIcon} />

            <Typography variant="small2" css={styles.bannerText}>
              <Trans
                i18nKey="market.bannerText"
                components={{
                  Link: (
                    <Typography
                      variant="small2"
                      component="a"
                      // TODO: add href
                      href="TBD"
                      target="_blank"
                      rel="noreferrer"
                    />
                  ),
                }}
              />
            </Typography>
          </div>
        </div>
      )}

      <Table assets={market.assets} />
    </>
  );
};

const MarketPage: React.FC = () => {
  // TODO: fetch actual values (see VEN-546)
  const isIsolatedLendingMarket = true;
  const totalSupplyCents = 1000000000;
  const totalBorrowCents = 100000000;
  const description =
    'The Metaverse pool offers increased LTV to allow  a leveraged SOL position up to 10x. Higher leverage comes at the cost of increased liquidation risk so proceed with caution.';

  return (
    <MarketPageUi
      // TODO: fetch actual market (see VEN-546)
      market={markets[0]}
      isIsolatedLendingMarket={isIsolatedLendingMarket}
      totalSupplyCents={totalSupplyCents}
      totalBorrowCents={totalBorrowCents}
      description={description}
    />
  );
};

export default MarketPage;
