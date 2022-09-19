import { QueryObserverOptions, useQuery } from 'react-query';

import getMarkets, { GetAssetsOutput } from 'clients/api/queries/getAssets';
import { DEFAULT_REFETCH_INTERVAL_MS } from 'constants/defaultRefetchInterval';
import FunctionKey from 'constants/functionKey';

type Options = QueryObserverOptions<
  GetAssetsOutput,
  Error,
  GetAssetsOutput,
  GetAssetsOutput,
  FunctionKey.GET_ASSETS
>;

const useGetAssets = (options?: Options) =>
  useQuery(FunctionKey.GET_ASSETS, getMarkets, {
    refetchInterval: DEFAULT_REFETCH_INTERVAL_MS,
    ...options,
  });

export default useGetAssets;
