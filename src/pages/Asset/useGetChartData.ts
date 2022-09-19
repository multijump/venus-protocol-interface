import BigNumber from 'bignumber.js';
import { ApyChartProps } from 'components';
import React from 'react';
import { VBepToken } from 'types';
import { formatPercentage } from 'utilities';

import { useGetAssetHistory } from 'clients/api';

const useGetChartData = ({ vTokenId }: { vTokenId: VBepToken['id'] }) => {
  const {
    data: assetSnapshotsData = {
      assetSnapshots: [],
    },
  } = useGetAssetHistory({
    vTokenId,
  });

  return React.useMemo(() => {
    const supplyChartData: ApyChartProps['data'] = [];
    const borrowChartData: ApyChartProps['data'] = [];

    [...assetSnapshotsData.assetSnapshots]
      // Snapshots are returned from earliest to oldest, so we reverse them to
      // pass them to the charts in the right order
      .reverse()
      .forEach(assetSnapshot => {
        const timestampMs = new Date(assetSnapshot.createdAt).getTime();

        supplyChartData.push({
          apyPercentage: formatPercentage(assetSnapshot.supplyApy),
          timestampMs,
          balanceCents: new BigNumber(assetSnapshot.totalSupply).multipliedBy(
            assetSnapshot.priceUSD,
          ),
        });

        borrowChartData.push({
          apyPercentage: formatPercentage(assetSnapshot.borrowApy),
          timestampMs,
          balanceCents: new BigNumber(assetSnapshot.totalBorrow).multipliedBy(
            assetSnapshot.priceUSD,
          ),
        });
      });

    return {
      supplyChartData,
      borrowChartData,
    };
  }, [JSON.stringify(assetSnapshotsData?.assetSnapshots)]);
};

export default useGetChartData;
